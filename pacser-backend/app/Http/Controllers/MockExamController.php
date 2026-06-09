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
        $level = $request->query('level', 'professional');
        $itemsPerSubject = $level === 'professional' ? 34 : 33;

        $subjects = Subject::all();
        $mockQuestions = [];

        // Fetch 30 random questions from each of the 5 subjects to total 150
        foreach ($subjects as $subject) {
            $questions = Question::whereHas('quizSet', function($q) use ($subject) {
                                    $q->where('subject_id', $subject->id);
                                 })
                                 ->where('is_pretest', false)
                                 ->with(['answers' => function ($query) {
                                     $query->inRandomOrder();
                                 }])
                                 ->inRandomOrder()
                                 ->take($itemsPerSubject)
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
