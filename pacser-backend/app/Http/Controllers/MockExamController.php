<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Subject;
use App\Models\MockExamResult;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;

class MockExamController extends Controller
{
    public function getQuestions(Request $request)
    {
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

    public function submit(Request $request)
    {
        $validated = $request->validate([
            'total_score' => 'required|numeric',
            'subject_scores' => 'required|array',
            'level' => 'required|string',
            'total_items' => 'required|numeric'
        ]);

        $user = $request->user();

        $result = MockExamResult::create([
            'user_id' => $user->id,
            'total_score' => $validated['total_score'],
            'total_items' => $validated['total_items'],
            'subject_scores' => $validated['subject_scores']
        ]);

        $user->mock_exam_completed = true;
        $user->save();

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
