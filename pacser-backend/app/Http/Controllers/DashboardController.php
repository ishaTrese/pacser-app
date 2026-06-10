<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateDailyMissions;
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
        $level = $request->query('level');

        return response()->json([
            'quiz_sets_done' => $quizSetsDone,
            'mastery' => $mastery,
            'continue_learning' => $level ? $this->getContinueLearning($user, $this->normalizeLevel($level)) : null,
            'streak_status' => $this->getStreakStatus($user),
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

    private function getStreakStatus($user): array
    {
        $today = now()->toDateString();
        GenerateDailyMissions::ensureForUser($user, $today);

        $maintainStreakMission = DB::table('user_missions')
            ->where('user_id', $user->id)
            ->where('date', $today)
            ->where('mission_type', 'maintain_streak')
            ->first();

        return [
            'current_streak' => (int) $user->streak,
            'last_study_date' => $user->last_study_date ? $user->last_study_date->toDateString() : null,
            'is_safe_today' => $user->last_study_date && $user->last_study_date->toDateString() === $today,
            'streak_freeze_active' => (bool) $user->streak_freeze_active,
            'inventory_streak_freezes' => (int) $user->inventory_streak_freezes,
            'maintain_streak_mission' => $maintainStreakMission ? [
                'id' => $maintainStreakMission->id,
                'is_completed' => (bool) $maintainStreakMission->is_completed,
                'is_claimed' => (bool) $maintainStreakMission->is_claimed,
                'progress' => (int) $maintainStreakMission->progress,
                'target' => (int) $maintainStreakMission->target,
                'points_reward' => (int) $maintainStreakMission->points_reward,
            ] : null,
        ];
    }

    private function normalizeLevel(?string $level): string
    {
        $key = strtolower(trim($level ?? 'professional'));

        return config("exam_subjects.aliases.$key", 'professional');
    }

    private function getContinueLearning($user, string $level): array
    {
        $subjectSlugs = config("exam_subjects.levels.$level.subjects", []);
        $slugOrder = array_flip($subjectSlugs);
        $completedQuizSetIds = DB::table('quiz_logs')
            ->where('user_id', $user->id)
            ->distinct()
            ->pluck('quiz_set_id')
            ->all();

        $subjects = DB::table('subjects')
            ->whereIn('slug', $subjectSlugs)
            ->get()
            ->sortBy(fn ($subject) => $slugOrder[$subject->slug] ?? 999)
            ->values();

        if ($subjects->isEmpty()) {
            return [
                'recommendation_reason' => 'all_subjects_completed',
                'subject_id' => null,
                'subject_name' => null,
                'subject_slug' => null,
                'quiz_set_id' => null,
                'quiz_set_title' => null,
                'is_locked' => false,
                'is_premium' => false,
                'message' => 'No reviewer subjects are available yet.',
            ];
        }

        $latestSet = DB::table('quiz_logs')
            ->join('quiz_sets', 'quiz_logs.quiz_set_id', '=', 'quiz_sets.id')
            ->join('subjects', 'quiz_sets.subject_id', '=', 'subjects.id')
            ->where('quiz_logs.user_id', $user->id)
            ->whereIn('subjects.slug', $subjectSlugs)
            ->orderByDesc('quiz_logs.created_at')
            ->orderByDesc('quiz_logs.id')
            ->select(
                'quiz_sets.id',
                'quiz_sets.name',
                'quiz_sets.order_index',
                'subjects.id as subject_id',
                'subjects.name as subject_name',
                'subjects.slug as subject_slug'
            )
            ->first();

        if (!$latestSet) {
            $firstSubject = $subjects->first();
            $firstSet = $this->firstIncompleteQuizSet($firstSubject->id, $completedQuizSetIds);

            return $this->formatContinueLearning($firstSubject, $firstSet, 'first_subject_start', $user);
        }

        $sameSubjectNextSet = $this->firstIncompleteQuizSet($latestSet->subject_id, $completedQuizSetIds);
        if ($sameSubjectNextSet) {
            return $this->formatContinueLearning($latestSet, $sameSubjectNextSet, 'next_set_same_subject', $user);
        }

        foreach ($subjects as $subject) {
            $nextSet = $this->firstIncompleteQuizSet($subject->id, $completedQuizSetIds);
            if ($nextSet) {
                return $this->formatContinueLearning($subject, $nextSet, 'next_incomplete_subject', $user);
            }
        }

        return [
            'recommendation_reason' => 'all_subjects_completed',
            'subject_id' => null,
            'subject_name' => null,
            'subject_slug' => null,
            'quiz_set_id' => null,
            'quiz_set_title' => null,
            'is_locked' => false,
            'is_premium' => false,
            'message' => 'You have completed the available reviewer sets for this level.',
        ];
    }

    private function firstIncompleteQuizSet(int $subjectId, array $completedQuizSetIds)
    {
        return DB::table('quiz_sets')
            ->where('subject_id', $subjectId)
            ->when(!empty($completedQuizSetIds), function ($query) use ($completedQuizSetIds) {
                $query->whereNotIn('id', $completedQuizSetIds);
            })
            ->orderBy('order_index')
            ->orderBy('id')
            ->first();
    }

    private function formatContinueLearning($subject, $quizSet, string $reason, $user): array
    {
        if (!$quizSet) {
            return [
                'recommendation_reason' => 'all_subjects_completed',
                'subject_id' => $subject->subject_id ?? $subject->id ?? null,
                'subject_name' => $subject->subject_name ?? $subject->name ?? null,
                'subject_slug' => $subject->subject_slug ?? $subject->slug ?? null,
                'quiz_set_id' => null,
                'quiz_set_title' => null,
                'is_locked' => false,
                'is_premium' => false,
                'message' => 'No quiz set is available for this subject yet.',
            ];
        }

        $isPremiumSet = (int) $quizSet->order_index === 3;
        $isLocked = $isPremiumSet && !$user->is_premium;

        return [
            'recommendation_reason' => $isLocked ? 'premium_locked_next_set' : $reason,
            'subject_id' => $subject->subject_id ?? $subject->id,
            'subject_name' => $subject->subject_name ?? $subject->name,
            'subject_slug' => $subject->subject_slug ?? $subject->slug,
            'quiz_set_id' => $quizSet->id,
            'quiz_set_title' => $quizSet->name,
            'is_locked' => $isLocked,
            'is_premium' => $isPremiumSet,
            'message' => $isLocked
                ? 'This next quiz set is available with Premium.'
                : 'Continue with the next recommended quiz set.',
        ];
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
