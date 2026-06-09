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
        $mockExamAnalytics = $this->getMockExamAnalytics($userId);
        $isPremium = (bool) $user->is_premium;

        return response()->json([
            'quiz_sets_done' => $quizSetsDone,
            'mastery' => $mastery,
            'mock_exam' => [
                'attempt_count' => $mockExamAttemptCount,
                'can_take_mock_exam' => $isPremium || $mockExamAttemptCount < 1,
                'attempts_remaining' => $isPremium ? null : max(0, 1 - $mockExamAttemptCount),
                'is_premium' => $isPremium,
                'best_result' => $mockExamAnalytics['best_result'],
                'latest_result' => $mockExamAnalytics['latest_result'],
            ],
            // Include user data too so the frontend can refresh user state if needed
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
}
