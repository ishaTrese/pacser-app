<?php

namespace App\Http\Controllers;

use App\Models\QuizSet;
use App\Models\Question;
use App\Models\QuizLog;
use App\Models\UserMission;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function getQuestions(Request $request, $id)
    {
        $user = $request->user();

        // Admin accounts bypass the energy system completely
        if ($user->role !== 'admin') {
            if ($user->energy <= 0) {
                return response()->json(['message' => 'Out of energy!'], 403);
            }
            // Deduct energy when they start the quiz
            $user->energy -= 1;
            $user->save();
        }

        $quizSet = QuizSet::findOrFail($id);

        // Load questions and answers randomly, excluding pretest-flagged ones
        $questions = Question::where('quiz_set_id', $quizSet->id)
            ->where('is_pretest', false)
            ->with(['answers' => function ($query) {
                $query->inRandomOrder();
            }])
            ->inRandomOrder()
            ->get();

        return response()->json([
            'quiz_set' => $quizSet,
            'questions' => $questions
        ]);
    }

    public function submitQuiz(Request $request)
    {
        $validated = $request->validate([
            'quiz_set_id' => 'required|exists:quiz_sets,id',
            'score' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

        $percentage = ($validated['score'] / $validated['total']) * 100;

        $log = QuizLog::create([
            'user_id' => $request->user()->id,
            'quiz_set_id' => $validated['quiz_set_id'],
            'score' => $validated['score'],
            'total' => $validated['total'],
            'percentage' => $percentage
        ]);

        // Award XP and Points
        $user = $request->user();

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
        if ($user->rank_id == 2) {
            $xpMultiplier += 0.05;
        } elseif ($user->rank_id == 3) {
            $xpMultiplier += 0.10;
            $pointsMultiplier += 0.05;
        } elseif ($user->rank_id == 4) {
            $xpMultiplier += 0.15;
            $pointsMultiplier += 0.10;
        } elseif ($user->rank_id == 5) {
            $xpMultiplier += 0.20;
            $pointsMultiplier += 0.15;
        } elseif ($user->rank_id == 6) {
            $xpMultiplier += 0.25;
            $pointsMultiplier += 0.20;
        } elseif ($user->rank_id == 7) {
            $xpMultiplier += 0.30;
            $pointsMultiplier += 0.25;
            if (now()->isMonday()) {
                $xpMultiplier += 1; // +100%
            }
        } elseif ($user->rank_id == 8) {
            $xpMultiplier += 0.50;
            $pointsMultiplier += 0.50;
        }

        $xpGained = (int) round($baseXp * $xpMultiplier);
        $pointsGained = (int) round($basePoints * $pointsMultiplier);

        // Apply Double XP Boost if active (shop item)
        if ($user->double_xp_until && \Carbon\Carbon::parse($user->double_xp_until)->isFuture()) {
            $xpGained *= 2;
        }

        $user->xp += $xpGained;
        $user->weekly_xp += $xpGained;
        $user->points += $pointsGained;
        $user->save();

        // Update Daily Missions
        $today = now()->toDateString();
        $missions = UserMission::where('user_id', $user->id)
                               ->where('date', $today)
                               ->where('is_completed', false)
                               ->get();

        foreach ($missions as $mission) {
            if ($mission->mission_type === 'complete_2_quiz_sets') {
                $mission->progress += 1;
            } elseif ($mission->mission_type === 'score_80_percent' && $percentage >= 80) {
                $mission->progress += 1;
            } elseif ($mission->mission_type === 'earn_100_xp') {
                $mission->progress += $xpGained;
            }

            if ($mission->progress >= $mission->target) {
                $mission->progress = $mission->target;
                $mission->is_completed = true;
            }
            $mission->save();
        }

        return response()->json([
            'message' => 'Score submitted successfully',
            'percentage' => $percentage,
            'xp_gained' => $xpGained,
            'points_gained' => $pointsGained,
            'log' => $log
        ]);
    }
}
