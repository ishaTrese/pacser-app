<?php

namespace App\Http\Controllers;

use App\Models\AccessCode;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function profileStats(Request $request)
    {
        $user = $request->user();

        // Calculate dynamic stats
        $totalLessons = $user->quizLogs()->distinct('quiz_set_id')->count();
        $totalQuizzesTaken = $user->quizLogs()->count();

        $totalScore = $user->quizLogs()->sum('score');
        $totalItems = $user->quizLogs()->sum('total');
        $accuracy = $totalItems > 0 ? round(($totalScore / $totalItems) * 100) : 0;

        // Check for 80% score or higher on any quiz
        $hasHighScore = $user->quizLogs()->whereRaw('(score / total) >= 0.8')->exists();

        // Check if completed all sets in one subject (3 sets)
        // This is a simplified check: grouping quiz logs by subject_id (via quiz_set)
        $completedAllInOne = false;
        // Optimization: For now we'll just check if they completed at least 3 distinct quiz sets in the same subject.
        $subjectCounts = $user->quizLogs()
            ->join('quiz_sets', 'quiz_logs.quiz_set_id', '=', 'quiz_sets.id')
            ->select('quiz_sets.subject_id', \DB::raw('count(distinct quiz_set_id) as set_count'))
            ->groupBy('quiz_sets.subject_id')
            ->get();

        foreach($subjectCounts as $sc) {
            if ($sc->set_count >= 3) {
                $completedAllInOne = true;
                break;
            }
        }

        // Calculate Level (using the same formula as frontend: Math.floor(0.1 * Math.sqrt(xp)) + 1)
        $level = floor(0.1 * sqrt($user->xp)) + 1;
        $mockExamAnalytics = $this->getMockExamAnalytics($user->id);

        // Compute Badges based on user stats
        $badges = [
            [ 'id' => 1, 'name' => 'First Quiz', 'earned' => $totalQuizzesTaken > 0 ],
            [ 'id' => 2, 'name' => '3-Day Streak', 'earned' => $user->streak >= 3 ],
            [ 'id' => 3, 'name' => '7-Day Streak', 'earned' => $user->streak >= 7 ],
            [ 'id' => 4, 'name' => 'Subject Master', 'earned' => $completedAllInOne ],
            [ 'id' => 5, 'name' => 'Top Scorer', 'earned' => $hasHighScore ],
            [ 'id' => 6, 'name' => 'Level 5', 'earned' => $level >= 5 ],
            [ 'id' => 7, 'name' => 'Mock Exam Complete', 'earned' => $user->mock_exam_completed ],
            [ 'id' => 8, 'name' => 'Premium', 'earned' => $user->is_premium ],
        ];

        // Rank Name mapping
        $rankNames = [
            1 => 'Applicant',
            2 => 'Clerk',
            3 => 'Officer',
            4 => 'Supervisor',
            5 => 'Director',
            6 => 'Secretary',
            7 => 'Commissioner',
            8 => 'Civil Service Champion',
        ];
        $rank = $rankNames[$user->rank_id] ?? 'Applicant';

        return response()->json([
            'stats' => [
                'total_lessons' => $totalLessons,
                'accuracy' => $accuracy,
                'streak' => $user->streak,
                'mock_exams_taken' => $mockExamAnalytics['attempt_count'],
                'rank' => $rank,
            ],
            'mock_exam' => $mockExamAnalytics,
            'badges' => $badges,
            'weekly_rewards' => $this->getWeeklyRewards($user->id),
            'rank_history' => $this->getRankHistory($user->id),
            'inventory' => $this->getInventorySummary($user),
            'streak_status' => $this->getStreakStatus($user),
            'practice_analytics' => $this->getPracticeAnalytics($user->id),
            'user' => $user
        ]);
    }

    public function updateAccount(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email' => 'required|email|unique:users,email,'.$user->id,
            'password' => 'nullable|min:6'
        ]);

        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        return response()->json(['message' => 'Account updated successfully', 'user' => $user]);
    }

    public function redeemCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $codeStr = strtoupper(trim($request->code));
        $accessCode = AccessCode::where('code', $codeStr)->first();

        if (!$accessCode) {
            return response()->json(['message' => 'Invalid access code.'], 400);
        }

        if ($accessCode->is_used) {
            return response()->json(['message' => 'This access code has already been redeemed.'], 400);
        }

        $user = $request->user();
        if ($user->is_premium) {
            return response()->json(['message' => 'You are already a premium member.'], 400);
        }

        // Redeem the code
        $accessCode->is_used = true;
        $accessCode->used_by = $user->id;
        $accessCode->used_at = now();
        $accessCode->save();

        $user->is_premium = true;
        $user->save();

        // Create Notification
        Notification::create([
            'user_id' => $user->id,
            'message' => 'Congratulations! You have successfully redeemed a code and unlocked Premium access.',
            'is_read' => false
        ]);

        return response()->json([
            'message' => 'Code redeemed successfully! You are now a Premium user.',
            'user' => $user
        ]);
    }

    private function getMockExamAnalytics(int $userId): array
    {
        $results = DB::table('mock_exam_results')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        $latestResult = $results->first();
        $bestResult = $results
            ->sortByDesc(function ($result) {
                return $this->mockExamPercentage($result);
            })
            ->first();

        return [
            'attempt_count' => $results->count(),
            'best_result' => $this->formatMockExamResult($bestResult),
            'latest_result' => $this->formatMockExamResult($latestResult),
        ];
    }

    private function formatMockExamResult($result): ?array
    {
        if (!$result) {
            return null;
        }

        $percentage = $this->mockExamPercentage($result);

        return [
            'id' => $result->id,
            'score' => (int) $result->total_score,
            'total_items' => (int) $result->total_items,
            'percentage' => $percentage,
            'passed' => $percentage >= 80,
            'taken_at' => $result->created_at,
        ];
    }

    private function mockExamPercentage($result): float
    {
        if (!$result || (int) $result->total_items <= 0) {
            return 0;
        }

        return round(((int) $result->total_score / (int) $result->total_items) * 100, 1);
    }

    private function getWeeklyRewards(int $userId): array
    {
        $rankNames = $this->rankNames();
        $rewards = DB::table('weekly_league_rewards')
            ->where('user_id', $userId)
            ->orderByDesc('week_start_date')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->take(5)
            ->get()
            ->map(fn ($reward) => $this->formatWeeklyReward($reward, $rankNames))
            ->values();

        return [
            'latest' => $rewards->first(),
            'recent' => $rewards,
        ];
    }

    private function formatWeeklyReward($reward, array $rankNames): array
    {
        return [
            'placement' => (int) $reward->placement,
            'reward_tier' => $reward->reward_tier,
            'badge_awarded' => $reward->badge_awarded,
            'points_awarded' => (int) $reward->points_awarded,
            'inventory_rewards' => $this->decodeJsonField($reward->inventory_rewards),
            'week_start_date' => $reward->week_start_date,
            'rank_name' => $rankNames[(int) $reward->rank_id] ?? 'Applicant',
            'created_at' => $reward->created_at,
        ];
    }

    private function getRankHistory(int $userId): array
    {
        $rankNames = $this->rankNames();
        $history = DB::table('rank_histories')
            ->where('user_id', $userId)
            ->orderByDesc('week_start_date')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->take(5)
            ->get()
            ->map(fn ($item) => $this->formatRankHistory($item, $rankNames))
            ->values();

        return [
            'latest' => $history->first(),
            'recent' => $history,
        ];
    }

    private function formatRankHistory($history, array $rankNames): array
    {
        return [
            'old_rank_name' => $rankNames[(int) $history->old_rank_id] ?? 'Applicant',
            'new_rank_name' => $rankNames[(int) $history->new_rank_id] ?? 'Applicant',
            'weekly_xp' => (int) $history->weekly_xp,
            'status' => $history->status,
            'week_start_date' => $history->week_start_date,
            'created_at' => $history->created_at,
        ];
    }

    private function getInventorySummary($user): array
    {
        $doubleXpUntil = $user->double_xp_until ? Carbon::parse($user->double_xp_until) : null;

        return [
            'inventory_energy_plus_one' => (int) $user->inventory_energy_plus_one,
            'inventory_energy_refills' => (int) $user->inventory_energy_refills,
            'inventory_double_xp' => (int) $user->inventory_double_xp,
            'inventory_streak_freezes' => (int) $user->inventory_streak_freezes,
            'streak_freeze_active' => (bool) $user->streak_freeze_active,
            'double_xp_active' => $doubleXpUntil ? $doubleXpUntil->isFuture() : false,
            'double_xp_until' => $doubleXpUntil ? $doubleXpUntil->toDateTimeString() : null,
        ];
    }

    private function getStreakStatus($user): array
    {
        $lastStudyDate = $user->last_study_date
            ? Carbon::parse($user->last_study_date)->toDateString()
            : null;

        return [
            'current_streak' => (int) $user->streak,
            'last_study_date' => $lastStudyDate,
            'is_safe_today' => $lastStudyDate === now()->toDateString(),
            'streak_freeze_active' => (bool) $user->streak_freeze_active,
            'inventory_streak_freezes' => (int) $user->inventory_streak_freezes,
        ];
    }

    private function getPracticeAnalytics(int $userId): array
    {
        $logs = DB::table('quiz_logs')
            ->join('quiz_sets', 'quiz_logs.quiz_set_id', '=', 'quiz_sets.id')
            ->where('quiz_logs.user_id', $userId)
            ->select(
                'quiz_logs.id',
                'quiz_logs.quiz_set_id',
                'quiz_logs.score',
                'quiz_logs.total',
                'quiz_logs.percentage',
                'quiz_logs.created_at',
                'quiz_sets.name as quiz_set_name',
                'quiz_sets.difficulty'
            );

        $totalAttempts = (clone $logs)->count();
        $uniqueQuizSetsCompleted = (clone $logs)->distinct('quiz_logs.quiz_set_id')->count('quiz_logs.quiz_set_id');
        $averageAccuracy = $totalAttempts > 0
            ? round((float) (clone $logs)->avg('quiz_logs.percentage'), 1)
            : 0;
        $perfectQuizCount = (clone $logs)
            ->whereColumn('quiz_logs.score', 'quiz_logs.total')
            ->where('quiz_logs.total', '>', 0)
            ->count();
        $difficultQuizCount = (clone $logs)
            ->where('quiz_sets.difficulty', 'difficult')
            ->count();

        $bestResult = (clone $logs)
            ->orderByDesc('quiz_logs.percentage')
            ->orderByDesc('quiz_logs.created_at')
            ->orderByDesc('quiz_logs.id')
            ->first();
        $latestResult = (clone $logs)
            ->orderByDesc('quiz_logs.created_at')
            ->orderByDesc('quiz_logs.id')
            ->first();

        return [
            'total_attempts' => $totalAttempts,
            'unique_quiz_sets_completed' => $uniqueQuizSetsCompleted,
            'average_accuracy' => $averageAccuracy,
            'perfect_quiz_count' => $perfectQuizCount,
            'difficult_quiz_count' => $difficultQuizCount,
            'best_result' => $this->formatPracticeResult($bestResult),
            'latest_result' => $this->formatPracticeResult($latestResult),
        ];
    }

    private function formatPracticeResult($result): ?array
    {
        if (!$result) {
            return null;
        }

        return [
            'id' => (int) $result->id,
            'quiz_set_id' => (int) $result->quiz_set_id,
            'quiz_set_name' => $result->quiz_set_name,
            'difficulty' => $result->difficulty ?: 'average',
            'score' => (int) $result->score,
            'total' => (int) $result->total,
            'percentage' => round((float) $result->percentage, 1),
            'taken_at' => $result->created_at,
        ];
    }

    private function decodeJsonField($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (!$value) {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function rankNames(): array
    {
        return [
            1 => 'Applicant',
            2 => 'Clerk',
            3 => 'Officer',
            4 => 'Supervisor',
            5 => 'Director',
            6 => 'Secretary',
            7 => 'Commissioner',
            8 => 'Civil Service Champion',
        ];
    }
}
