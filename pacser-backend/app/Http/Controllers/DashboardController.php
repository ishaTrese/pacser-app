<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $userId = $request->user()->id;

        // Count unique quiz sets done by this user
        $quizSetsDone = DB::table('quiz_logs')
            ->where('user_id', $userId)
            ->distinct('quiz_set_id')
            ->count('quiz_set_id');

        // Calculate mastery per subject
        // Mastery could be the average percentage of their highest scores per quiz set,
        // but for simplicity let's just average the percentage of all logs per subject.
        $subjectMasteryRaw = DB::table('quiz_logs')
            ->join('quiz_sets', 'quiz_logs.quiz_set_id', '=', 'quiz_sets.id')
            ->join('subjects', 'quiz_sets.subject_id', '=', 'subjects.id')
            ->where('quiz_logs.user_id', $userId)
            ->select('subjects.slug', DB::raw('AVG(quiz_logs.percentage) as mastery'))
            ->groupBy('subjects.slug')
            ->get();

        $mastery = [];
        foreach ($subjectMasteryRaw as $row) {
            $mastery[$row->slug] = round($row->mastery);
        }

        $user = $request->user();
        $mockExamAttemptCount = DB::table('mock_exam_results')
            ->where('user_id', $userId)
            ->count();
        $isPremium = (bool) $user->is_premium;

        return response()->json([
            'quiz_sets_done' => $quizSetsDone,
            'mastery' => $mastery,
            'mock_exam' => [
                'attempt_count' => $mockExamAttemptCount,
                'can_take_mock_exam' => $isPremium || $mockExamAttemptCount < 1,
                'attempts_remaining' => $isPremium ? null : max(0, 1 - $mockExamAttemptCount),
                'is_premium' => $isPremium,
            ],
            // Include user data too so the frontend can refresh user state if needed
            'user' => $user
        ]);
    }
}
