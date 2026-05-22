<?php

namespace App\Http\Controllers;

use App\Models\QuizSet;
use App\Models\Question;
use App\Models\QuizLog;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function getQuestions(Request $request, $id)
    {
        $user = $request->user();
        if ($user->energy <= 0) {
            return response()->json(['message' => 'Out of energy!'], 403);
        }

        // Deduct energy when they start the quiz
        $user->energy -= 1;
        $user->save();

        $quizSet = QuizSet::findOrFail($id);
        
        // Load questions and answers randomly
        $questions = Question::where('quiz_set_id', $quizSet->id)
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
        $xpGained = ($validated['score'] * 10) + ($percentage == 100 ? 20 : 0);
        $pointsGained = $validated['score'] * 5;

        $user->xp += $xpGained;
        $user->points += $pointsGained;
        $user->save();
        
        return response()->json([
            'message' => 'Score submitted successfully',
            'percentage' => $percentage,
            'xp_gained' => $xpGained,
            'points_gained' => $pointsGained,
            'log' => $log
        ]);
    }
}
