<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubjectController extends Controller
{
    public function getQuizSets(Request $request, $slug)
    {
        $subject = Subject::where('slug', $slug)->firstOrFail();
        $user = $request->user();
        
        // Fetch quiz sets with basic details
        $quizSets = $subject->quizSets()->orderBy('order_index')->get();
        $quizLogs = DB::table('quiz_logs')
            ->where('user_id', $user->id)
            ->whereIn('quiz_set_id', $quizSets->pluck('id'))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->groupBy('quiz_set_id');
        
        // For iteration 2, we will just return them.
        // We will mock the questions count or time later, or fetch it.
        $mapped = $quizSets->map(function ($set) use ($user, $quizLogs) {
            $isPremiumSet = $set->order_index == 3;
            $setLogs = $quizLogs->get($set->id, collect());
            $isCompleted = $setLogs->isNotEmpty();
            $status = ($isPremiumSet && !$user->is_premium)
                ? 'locked'
                : ($isCompleted ? 'completed' : 'available');
            $questionCount = $set->questions()->count();
            $difficulty = $this->difficultyMetadata($set->difficulty, $questionCount);
            $bestResult = $this->formatQuizResult($this->bestQuizLog($setLogs));
            $latestResult = $this->formatQuizResult($setLogs->first());

            return [
                'id' => $set->id,
                'title' => $set->name,
                'questions' => $questionCount,
                'time' => $difficulty['time'],
                'status' => $status,
                'is_premium' => $isPremiumSet,
                'difficulty' => $difficulty['difficulty'],
                'difficulty_label' => $difficulty['difficulty_label'],
                'reward_label' => $difficulty['reward_label'],
                'has_timer' => $difficulty['has_timer'],
                'time_limit_seconds' => $difficulty['time_limit_seconds'],
                'is_completed' => $isCompleted,
                'attempt_count' => $setLogs->count(),
                'best_result' => $bestResult,
                'latest_result' => $latestResult,
                'score' => $bestResult ? "{$bestResult['score']}/{$bestResult['total']}" : null
            ];
        });

        return response()->json([
            'subject' => $subject,
            'quiz_sets' => $mapped
        ]);
    }

    private function difficultyMetadata(?string $difficulty, int $questionCount): array
    {
        $normalizedDifficulty = in_array($difficulty, ['easy', 'average', 'difficult'], true)
            ? $difficulty
            : 'average';

        if ($normalizedDifficulty === 'easy') {
            return [
                'difficulty' => 'easy',
                'difficulty_label' => 'Easy',
                'reward_label' => 'Lower rewards',
                'has_timer' => false,
                'time_limit_seconds' => null,
                'time' => 'Untimed',
            ];
        }

        if ($normalizedDifficulty === 'difficult') {
            $timeLimitSeconds = max(0, $questionCount * 60);

            return [
                'difficulty' => 'difficult',
                'difficulty_label' => 'Difficult',
                'reward_label' => 'Challenge rewards',
                'has_timer' => true,
                'time_limit_seconds' => $timeLimitSeconds,
                'time' => $this->formatTimeLimit($timeLimitSeconds),
            ];
        }

        return [
            'difficulty' => 'average',
            'difficulty_label' => 'Average',
            'reward_label' => 'Standard rewards',
            'has_timer' => false,
            'time_limit_seconds' => null,
            'time' => 'Untimed',
        ];
    }

    private function formatTimeLimit(int $seconds): string
    {
        if ($seconds <= 0) {
            return 'Timed Challenge';
        }

        $minutes = (int) ceil($seconds / 60);

        return $minutes . ' min' . ($minutes === 1 ? '' : 's');
    }

    private function bestQuizLog($logs)
    {
        return $logs->reduce(function ($best, $log) {
            if (!$best) {
                return $log;
            }

            $logPercentage = (float) $log->percentage;
            $bestPercentage = (float) $best->percentage;

            if ($logPercentage > $bestPercentage) {
                return $log;
            }

            if ($logPercentage === $bestPercentage) {
                if ($log->created_at > $best->created_at) {
                    return $log;
                }

                if ($log->created_at === $best->created_at && (int) $log->id > (int) $best->id) {
                    return $log;
                }
            }

            return $best;
        });
    }

    private function formatQuizResult($log): ?array
    {
        if (!$log) {
            return null;
        }

        return [
            'id' => (int) $log->id,
            'score' => (int) $log->score,
            'total' => (int) $log->total,
            'percentage' => round((float) $log->percentage, 1),
            'taken_at' => $log->created_at,
        ];
    }
}
