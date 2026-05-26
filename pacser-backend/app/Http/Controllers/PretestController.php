<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subject;
use App\Models\Question;
use Illuminate\Support\Facades\DB;

class PretestController extends Controller
{
    public function getQuestions(Request $request)
    {
        // 50 questions total, 10 per subject
        $subjects = Subject::all();
        $pretestQuestions = collect();

        foreach ($subjects as $subject) {
            $questions = Question::join('quiz_sets', 'questions.quiz_set_id', '=', 'quiz_sets.id')
                ->where('quiz_sets.subject_id', $subject->id)
                ->where('questions.is_pretest', true)
                ->with(['answers' => function ($q) { $q->inRandomOrder(); }])
                ->inRandomOrder()
                ->limit(10)
                ->select('questions.*')
                ->get();

            // Fallback: If not enough is_pretest questions, fill the rest from the general pool
            if ($questions->count() < 10) {
                $needed = 10 - $questions->count();
                $existingIds = $questions->pluck('id')->toArray();
                
                $fallbackQuestions = Question::join('quiz_sets', 'questions.quiz_set_id', '=', 'quiz_sets.id')
                    ->where('quiz_sets.subject_id', $subject->id)
                    ->whereNotIn('questions.id', $existingIds)
                    ->with(['answers' => function ($q) { $q->inRandomOrder(); }])
                    ->inRandomOrder()
                    ->limit($needed)
                    ->select('questions.*')
                    ->get();
                    
                $questions = $questions->concat($fallbackQuestions);
            }

            // Shuffle answers and map subject info for the frontend
            $questions = $questions->map(function ($q) use ($subject) {
                $qArr = $q->toArray();
                $qArr['subject_slug'] = $subject->slug;
                $qArr['subject_name'] = $subject->name;
                $qArr['subject_id'] = $subject->id;
                return $qArr;
            });

            $pretestQuestions = $pretestQuestions->concat($questions);
        }

        return response()->json([
            'questions' => $pretestQuestions->shuffle()->values()
        ]);
    }

    public function submit(Request $request)
    {
        $validated = $request->validate([
            'scores' => 'required|array', // e.g. ['mathematics' => ['score' => 8, 'total' => 10, 'subject_id' => 1], ...]
        ]);

        $user = $request->user();

        // Save scores
        foreach ($validated['scores'] as $subjectSlug => $data) {
            DB::table('pretest_scores')->insert([
                'user_id' => $user->id,
                'subject_id' => $data['subject_id'],
                'score' => $data['score'],
                'total' => $data['total'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Mark pretest as completed
        $user->pretest_completed = true;
        $user->save();

        return response()->json([
            'message' => 'Pretest submitted successfully',
            'user' => $user
        ]);
    }
}
