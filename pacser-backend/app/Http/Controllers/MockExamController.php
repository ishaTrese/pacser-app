<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Subject;
use App\Models\MockExamResult;
use App\Services\StreakService;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;

class MockExamController extends Controller
{
    public function __construct(private StreakService $streakService)
    {
    }

    public function getQuestions(Request $request)
    {
        $user = $request->user();

        if (!$user->is_premium && MockExamResult::where('user_id', $user->id)->count() >= 1) {
            return response()->json([
                'message' => 'Free users are limited to 1 mock exam attempt. Upgrade to Premium for unlimited attempts.'
            ], 403);
        }

        $level = $this->normalizeLevel($request->query('level', 'professional'));
        $allocation = config("exam_subjects.levels.$level.mock_exam_allocation", []);
        $subjectSlugs = config("exam_subjects.levels.$level.subjects", []);
        $slugOrder = array_flip($subjectSlugs);

        $subjects = Subject::whereIn('slug', $subjectSlugs)
            ->get()
            ->sortBy(fn ($subject) => $slugOrder[$subject->slug] ?? 999)
            ->values();
        $mockQuestions = [];

        // Fetch the official item allocation for each subject in the selected level.
        foreach ($subjects as $subject) {
            $itemsForSubject = $allocation[$subject->slug] ?? 0;

            $questions = Question::whereHas('quizSet', function($q) use ($subject) {
                                    $q->where('subject_id', $subject->id);
                                 })
                                 ->where('is_pretest', false)
                                 ->with(['answers' => function ($query) {
                                     $query->inRandomOrder();
                                 }])
                                 ->inRandomOrder()
                                 ->take($itemsForSubject)
                                 ->get();

            $questions = $questions->map(function ($q) use ($subject) {
                $qArr = $q->toArray();
                $qArr['subject_slug'] = $subject->slug;
                $qArr['subject_name'] = $subject->name;
                $qArr['subject_id'] = $subject->id;
                return $qArr;
            });

            $mockQuestions = array_merge($mockQuestions, $questions->all());
        }

        // Shuffle the final questions so subjects are mixed
        shuffle($mockQuestions);

        return response()->json([
            'questions' => $mockQuestions
        ]);
    }

    private function normalizeLevel(?string $level): string
    {
        $key = strtolower(trim($level ?? 'professional'));

        return config("exam_subjects.aliases.$key", 'professional');
    }

    public function history(Request $request)
    {
        $subjectNames = Subject::pluck('name', 'slug');

        $attempts = MockExamResult::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(function (MockExamResult $result) use ($subjectNames) {
                $percentage = $this->percentage($result->total_score, $result->total_items);

                return [
                    'id' => $result->id,
                    'score' => (int) $result->total_score,
                    'total_items' => (int) $result->total_items,
                    'percentage' => $percentage,
                    'passed' => $percentage >= 80,
                    'taken_at' => $result->created_at,
                    'subject_scores' => $this->sanitizeSubjectScores($result->subject_scores, $subjectNames),
                ];
            })
            ->values();

        return response()->json([
            'attempts' => $attempts,
        ]);
    }

    private function sanitizeSubjectScores($subjectScores, $subjectNames): array
    {
        if (!is_array($subjectScores)) {
            return [];
        }

        $sanitized = [];

        foreach ($subjectScores as $slug => $scoreData) {
            if (!is_array($scoreData)) {
                continue;
            }

            $score = (int) ($scoreData['score'] ?? 0);
            $total = (int) ($scoreData['total'] ?? 0);

            $sanitized[] = [
                'subject_slug' => $slug,
                'subject_name' => $subjectNames[$slug] ?? ucwords(str_replace('-', ' ', $slug)),
                'subject_id' => $scoreData['subject_id'] ?? null,
                'score' => $score,
                'total' => $total,
                'percentage' => $this->percentage($score, $total),
            ];
        }

        return $sanitized;
    }

    private function percentage($score, $total): float
    {
        $total = (int) $total;

        if ($total <= 0) {
            return 0;
        }

        return round(((int) $score / $total) * 100, 1);
    }

    public function submit(Request $request)
    {
        $validated = $request->validate([
            'total_score' => 'required|numeric',
            'subject_scores' => 'required|array',
            'level' => 'required|string',
            'total_items' => 'required|numeric'
        ]);

        $user = $request->user();

        if (!$user->is_premium && MockExamResult::where('user_id', $user->id)->count() >= 1) {
            return response()->json([
                'message' => 'Free users are limited to 1 mock exam attempt. Upgrade to Premium for unlimited attempts.'
            ], 403);
        }

        $result = MockExamResult::create([
            'user_id' => $user->id,
            'total_score' => $validated['total_score'],
            'total_items' => $validated['total_items'],
            'subject_scores' => $validated['subject_scores']
        ]);

        $user->mock_exam_completed = true;
        $user->save();

        $this->streakService->recordStudyActivity($user);

        // Fetch pretest scores to return for comparison
        $pretestScores = DB::table('pretest_scores')
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'message' => 'Mock exam submitted successfully',
            'result' => $result,
            'pretest_scores' => $pretestScores
        ]);
    }
}
