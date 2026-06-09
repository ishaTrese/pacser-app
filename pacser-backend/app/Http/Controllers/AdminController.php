<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function godModeUpdate(Request $request)
    {
        $user = $request->user();

        // Ensure only admins can use this
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'energy' => 'nullable|integer|min:0',
            'points' => 'nullable|integer|min:0',
            'xp' => 'nullable|integer|min:0',
            'streak' => 'nullable|integer|min:0',
        ]);

        if (isset($validated['energy'])) $user->energy = $validated['energy'];
        if (isset($validated['points'])) $user->points = $validated['points'];
        if (isset($validated['xp'])) {
            $user->xp = $validated['xp'];
            $user->weekly_xp = $validated['xp'];
        }
        if (isset($validated['streak'])) $user->streak = $validated['streak'];

        if ($request->has('remove_double_xp') && $request->input('remove_double_xp') === true) {
            $user->double_xp_until = null;
        }

        if ($request->has('remove_streak_freeze') && $request->input('remove_streak_freeze') === true) {
            $user->streak_freeze_active = false;
        }

        $user->save();

        return response()->json([
            'message' => 'God Mode update successful',
            'user' => $user
        ]);
    }

    public function stats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'total_users' => \App\Models\User::count(),
            'total_questions' => \App\Models\Question::count(),
            'total_quiz_sets' => \App\Models\QuizSet::count(),
        ]);
    }

    public function getQuestions(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $questions = \App\Models\Question::with('answers', 'quizSet.subject')->orderBy('id', 'desc')->get();
        
        return response()->json([
            'questions' => $questions
        ]);
    }

    public function createQuestion(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'quiz_set_id' => 'required|exists:quiz_sets,id',
            'question_text' => 'required|string',
            'explanation' => 'nullable|string',
            'is_pretest' => 'boolean',
            'answers' => 'required|array|min:2',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        $question = \App\Models\Question::create([
            'quiz_set_id' => $validated['quiz_set_id'],
            'question_text' => $validated['question_text'],
            'explanation' => $validated['explanation'],
            'is_pretest' => $validated['is_pretest'] ?? false,
        ]);

        foreach ($validated['answers'] as $ans) {
            \App\Models\Answer::create([
                'question_id' => $question->id,
                'answer_text' => $ans['answer_text'],
                'is_correct' => $ans['is_correct'],
            ]);
        }

        return response()->json(['message' => 'Question created successfully', 'question' => $question]);
    }

    public function updateQuestion(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'quiz_set_id' => 'required|exists:quiz_sets,id',
            'question_text' => 'required|string',
            'explanation' => 'nullable|string',
            'is_pretest' => 'boolean',
            'answers' => 'required|array|min:2',
            'answers.*.id' => 'nullable|exists:answers,id',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        $question = \App\Models\Question::findOrFail($id);
        $question->update([
            'quiz_set_id' => $validated['quiz_set_id'],
            'question_text' => $validated['question_text'],
            'explanation' => $validated['explanation'],
            'is_pretest' => $validated['is_pretest'] ?? false,
        ]);

        // Replace answers entirely or update them
        // For simplicity, delete old and recreate to avoid orphans if answers were removed
        $question->answers()->delete();

        foreach ($validated['answers'] as $ans) {
            \App\Models\Answer::create([
                'question_id' => $question->id,
                'answer_text' => $ans['answer_text'],
                'is_correct' => $ans['is_correct'],
            ]);
        }

        return response()->json(['message' => 'Question updated successfully', 'question' => $question]);
    }

    public function deleteQuestion(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question = \App\Models\Question::findOrFail($id);
        $question->delete();

        return response()->json(['message' => 'Question deleted successfully']);
    }
}
