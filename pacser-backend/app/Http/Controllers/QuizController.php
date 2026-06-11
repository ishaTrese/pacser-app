<?php

namespace App\Http\Controllers;

use App\Models\QuizSet;
use App\Models\Question;
use App\Models\QuizLog;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\UserMission;
use App\Models\Notification;
use App\Services\StreakService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    public function __construct(private StreakService $streakService)
    {
    }

    public function getQuestions(Request $request, $id)
    {
        $user = $request->user()->fresh();
        $quizSet = QuizSet::findOrFail($id);

        $this->authorizeQuizSetAccess($user, $quizSet);

        if ($user->role !== 'admin') {
            $attempt = QuizAttempt::where('user_id', $user->id)
                ->where('quiz_set_id', $quizSet->id)
                ->where('status', 'started')
                ->latest()
                ->first();

            if (!$attempt) {
                if ((int) $user->energy <= 0) {
                    return response()->json(['message' => 'Out of energy!'], 403);
                }

                return response()->json([
                    'message' => 'Start a quiz attempt before loading questions.'
                ], 409);
            }

            return $this->quizPayload($quizSet, $attempt);
        }

        return $this->quizPayload($quizSet);
    }

    public function start(Request $request, $id)
    {
        $user = $request->user()->fresh();
        $quizSet = QuizSet::findOrFail($id);

        $this->authorizeQuizSetAccess($user, $quizSet);

        $chargedThisRequest = false;

        $attempt = DB::transaction(function () use ($user, $quizSet, &$chargedThisRequest) {
            $lockedUser = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $activeAttemptKey = $this->activeAttemptKey($lockedUser->id, $quizSet->id);

            $activeAttempt = QuizAttempt::where('user_id', $user->id)
                ->where('quiz_set_id', $quizSet->id)
                ->where('status', 'started')
                ->latest()
                ->lockForUpdate()
                ->first();

            if ($activeAttempt) {
                return $activeAttempt;
            }

            $energyCharged = false;

            // Admin accounts bypass the energy system completely.
            if ($lockedUser->role !== 'admin') {
                if ((int) $lockedUser->energy <= 0) {
                    throw new HttpResponseException(response()->json(['message' => 'Out of energy!'], 403));
                }

                $lockedUser->energy -= 1;
                $lockedUser->save();
                $energyCharged = true;
                $chargedThisRequest = true;
            }

            return QuizAttempt::create([
                'user_id' => $lockedUser->id,
                'quiz_set_id' => $quizSet->id,
                'active_attempt_key' => $activeAttemptKey,
                'status' => 'started',
                'energy_charged' => $energyCharged,
                'started_at' => now(),
            ]);
        });

        $freshUser = $request->user()->fresh();

        return $this->quizPayload($quizSet, $attempt, [
            'energy_charged' => $chargedThisRequest,
            'user_energy' => (int) $freshUser->energy,
            'user_max_energy' => (int) $freshUser->max_energy,
        ]);
    }

    private function quizPayload(QuizSet $quizSet, ?QuizAttempt $attempt = null, array $extra = [])
    {
        // Load questions and answers randomly, excluding pretest-flagged ones
        $questions = Question::where('quiz_set_id', $quizSet->id)
            ->where('is_pretest', false)
            ->with(['answers' => function ($query) {
                $query->inRandomOrder();
            }])
            ->inRandomOrder()
            ->get();

        $difficulty = $this->normalizeDifficulty($quizSet->difficulty);
        $timeLimitSeconds = $difficulty === 'difficult' ? $questions->count() * 60 : null;

        return response()->json(array_merge([
            'attempt_id' => $attempt?->id,
            'quiz_set' => array_merge($quizSet->toArray(), [
                'difficulty' => $difficulty,
                'has_timer' => $difficulty === 'difficult',
                'time_limit_seconds' => $timeLimitSeconds,
            ]),
            'questions' => $questions
        ], $extra));
    }

    public function submitQuiz(Request $request)
    {
        $validated = $request->validate([
            'quiz_set_id' => 'required|exists:quiz_sets,id',
            'attempt_id' => 'required|exists:quiz_attempts,id',
            'score' => 'required|numeric|min:0|lte:total',
            'total' => 'required|numeric|min:1',
        ]);

        $user = $request->user();

        $result = DB::transaction(function () use ($validated, $user) {
            $attempt = QuizAttempt::where('id', $validated['attempt_id'])
                ->where('user_id', $user->id)
                ->where('quiz_set_id', $validated['quiz_set_id'])
                ->lockForUpdate()
                ->first();

            if (!$attempt || $attempt->status !== 'started') {
                throw new HttpResponseException(response()->json([
                    'message' => 'Quiz attempt is no longer active.'
                ], 422));
            }

            $lockedUser = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $percentage = ($validated['score'] / $validated['total']) * 100;
            $quizSet = QuizSet::findOrFail($validated['quiz_set_id']);
            $difficulty = $this->normalizeDifficulty($quizSet->difficulty);
            $difficultyMultiplier = $this->difficultyMultiplier($difficulty);

            $log = QuizLog::create([
                'user_id' => $lockedUser->id,
                'quiz_set_id' => $validated['quiz_set_id'],
                'score' => $validated['score'],
                'total' => $validated['total'],
                'percentage' => $percentage
            ]);

            // Award XP and Points
            $baseXp = $validated['score'] * 3;
            $basePoints = $validated['score'] * 5;

            $xpMultiplier = 1;
            $pointsMultiplier = 1;

            // Passive Rank Perks
            // 2: Clerk (+5% XP)
            // 3: Officer (+10% XP, +5% Points)
            // 4: Supervisor (+15% XP, +10% Points)
            // 5: Director (+20% XP, +15% Points)
            // 6: Secretary (+25% XP, +20% Points)
            // 7: Commissioner (+30% XP, +25% Points)
            // 8: Champion (+50% XP, +50% Points)
            if ($lockedUser->rank_id == 2) {
                $xpMultiplier += 0.05;
            } elseif ($lockedUser->rank_id == 3) {
                $xpMultiplier += 0.10;
                $pointsMultiplier += 0.05;
            } elseif ($lockedUser->rank_id == 4) {
                $xpMultiplier += 0.15;
                $pointsMultiplier += 0.10;
            } elseif ($lockedUser->rank_id == 5) {
                $xpMultiplier += 0.20;
                $pointsMultiplier += 0.15;
            } elseif ($lockedUser->rank_id == 6) {
                $xpMultiplier += 0.25;
                $pointsMultiplier += 0.20;
            } elseif ($lockedUser->rank_id == 7) {
                $xpMultiplier += 0.30;
                $pointsMultiplier += 0.25;
                if (now()->isMonday()) {
                    $xpMultiplier += 1; // +100%
                }
            } elseif ($lockedUser->rank_id == 8) {
                $xpMultiplier += 0.50;
                $pointsMultiplier += 0.50;
            }

            $xpGained = (int) round($baseXp * $difficultyMultiplier * $xpMultiplier);
            $pointsGained = (int) round($basePoints * $difficultyMultiplier * $pointsMultiplier);

            // Apply Double XP Boost if active (shop item)
            if ($lockedUser->double_xp_until && \Carbon\Carbon::parse($lockedUser->double_xp_until)->isFuture()) {
                $xpGained *= 2;
            }

            $perfectScoreBonusAwarded = (int) $validated['score'] === (int) $validated['total'] && (int) $validated['total'] > 0;
            $perfectScoreBonusXp = $perfectScoreBonusAwarded ? 25 : 0;
            $perfectScoreBonusPoints = $perfectScoreBonusAwarded ? 50 : 0;
            $totalXpGained = $xpGained + $perfectScoreBonusXp;
            $totalPointsGained = $pointsGained + $perfectScoreBonusPoints;

            $lockedUser->xp += $totalXpGained;
            $lockedUser->weekly_xp += $totalXpGained;
            $lockedUser->points += $totalPointsGained;
            $lockedUser->save();

            if ($perfectScoreBonusAwarded) {
                Notification::create([
                    'user_id' => $lockedUser->id,
                    'message' => 'Perfect score! You earned a +25 XP and +50 Points bonus.',
                    'is_read' => false,
                ]);
            }

            // Update Daily Missions
            $today = now()->toDateString();
            $missions = UserMission::where('user_id', $lockedUser->id)
                                   ->where('date', $today)
                                   ->where('is_completed', false)
                                   ->get();

            foreach ($missions as $mission) {
                if ($mission->mission_type === 'complete_2_quiz_sets') {
                    $mission->progress += 1;
                } elseif ($mission->mission_type === 'score_80_percent' && $percentage >= 80) {
                    $mission->progress += 1;
                } elseif ($mission->mission_type === 'earn_100_xp') {
                    $mission->progress += $totalXpGained;
                }

                if ($mission->progress >= $mission->target) {
                    $mission->progress = $mission->target;
                    $mission->is_completed = true;
                }
                $mission->save();
            }

            $this->streakService->recordStudyActivity($lockedUser);

            $attempt->update([
                'status' => 'submitted',
                'active_attempt_key' => null,
                'submitted_at' => now(),
            ]);

            return [
                'percentage' => $percentage,
                'xp_gained' => $totalXpGained,
                'points_gained' => $totalPointsGained,
                'difficulty' => $difficulty,
                'difficulty_multiplier' => $difficultyMultiplier,
                'base_xp' => $baseXp,
                'awarded_xp' => $xpGained,
                'base_points' => $basePoints,
                'awarded_points' => $pointsGained,
                'perfect_score_bonus_awarded' => $perfectScoreBonusAwarded,
                'perfect_score_bonus_xp' => $perfectScoreBonusXp,
                'perfect_score_bonus_points' => $perfectScoreBonusPoints,
                'log' => $log,
            ];
        });

        return response()->json([
            'message' => 'Score submitted successfully',
        ] + $result);
    }

    private function normalizeDifficulty(?string $difficulty): string
    {
        return in_array($difficulty, ['easy', 'average', 'difficult'], true)
            ? $difficulty
            : 'average';
    }

    private function authorizeQuizSetAccess($user, QuizSet $quizSet): void
    {
        if ($user->role !== 'admin' && $quizSet->order_index == 3 && !$user->is_premium) {
            throw new HttpResponseException(response()->json([
                'message' => 'This quiz set requires Premium access.'
            ], 403));
        }
    }

    private function activeAttemptKey(int $userId, int $quizSetId): string
    {
        return $userId . ':' . $quizSetId;
    }

    private function difficultyMultiplier(string $difficulty): float
    {
        return match ($difficulty) {
            'easy' => 0.75,
            'difficult' => 1.5,
            default => 1.0,
        };
    }
}
