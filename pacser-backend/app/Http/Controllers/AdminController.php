<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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

        $validated = $request->validate([
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'quiz_set_id' => 'nullable|integer|exists:quiz_sets,id',
            'difficulty' => 'nullable|in:easy,average,difficult',
            'is_pretest' => 'nullable|in:true,false,1,0',
            'search' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = min((int) ($validated['per_page'] ?? 20), 50);

        $query = \App\Models\Question::with('answers', 'quizSet.subject')
            ->when($validated['quiz_set_id'] ?? null, function ($query, $quizSetId) {
                $query->where('quiz_set_id', $quizSetId);
            })
            ->when(array_key_exists('is_pretest', $validated), function ($query) use ($validated) {
                $query->where('is_pretest', filter_var($validated['is_pretest'], FILTER_VALIDATE_BOOLEAN));
            })
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($nested) use ($search) {
                    $nested->where('question_text', 'like', "%{$search}%")
                        ->orWhere('explanation', 'like', "%{$search}%");
                });
            })
            ->when(($validated['subject_id'] ?? null) || ($validated['difficulty'] ?? null), function ($query) use ($validated) {
                $query->whereHas('quizSet', function ($quizSetQuery) use ($validated) {
                    if ($validated['subject_id'] ?? null) {
                        $quizSetQuery->where('subject_id', $validated['subject_id']);
                    }

                    if ($validated['difficulty'] ?? null) {
                        $quizSetQuery->where('difficulty', $validated['difficulty']);
                    }
                });
            })
            ->orderBy('id', 'desc');

        $questions = $query->paginate($perPage);
        
        return response()->json([
            'questions' => $questions->items(),
            'pagination' => [
                'current_page' => $questions->currentPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
                'last_page' => $questions->lastPage(),
                'from' => $questions->firstItem(),
                'to' => $questions->lastItem(),
            ],
        ]);
    }

    public function getQuestion(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question = \App\Models\Question::with('answers', 'quizSet.subject')->findOrFail($id);

        return response()->json([
            'question' => $question
        ]);
    }

    public function getQuizSets(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quizSets = \App\Models\QuizSet::with('subject')
            ->withCount('questions')
            ->orderBy('subject_id')
            ->orderBy('order_index')
            ->get()
            ->map(fn ($quizSet) => $this->formatQuizSet($quizSet));

        return response()->json([
            'quiz_sets' => $quizSets,
            'subjects' => \App\Models\Subject::orderBy('name')->get(),
        ]);
    }

    public function getQuizSet(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quizSet = \App\Models\QuizSet::with('subject')
            ->withCount('questions')
            ->findOrFail($id);

        return response()->json([
            'quiz_set' => $this->formatQuizSet($quizSet),
        ]);
    }

    public function createQuizSet(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $this->validateQuizSetPayload($request);

        $quizSet = \App\Models\QuizSet::create([
            'subject_id' => $validated['subject_id'],
            'name' => trim($validated['name']),
            'order_index' => $validated['order_index'],
            'difficulty' => $validated['difficulty'],
        ]);

        return response()->json([
            'message' => 'Quiz set created successfully',
            'quiz_set' => $this->formatQuizSet($quizSet->load('subject')->loadCount('questions')),
        ], 201);
    }

    public function updateQuizSet(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quizSet = \App\Models\QuizSet::findOrFail($id);
        $validated = $this->validateQuizSetPayload($request, $quizSet->id);

        $quizSet->update([
            'subject_id' => $validated['subject_id'],
            'name' => trim($validated['name']),
            'order_index' => $validated['order_index'],
            'difficulty' => $validated['difficulty'],
        ]);

        return response()->json([
            'message' => 'Quiz set updated successfully',
            'quiz_set' => $this->formatQuizSet($quizSet->load('subject')->loadCount('questions')),
        ]);
    }

    public function deleteQuizSet(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quizSet = \App\Models\QuizSet::withCount('questions')->findOrFail($id);

        if ($quizSet->questions_count > 0) {
            return response()->json([
                'message' => 'Cannot delete a quiz set that already has questions.',
            ], 422);
        }

        $quizSet->delete();

        return response()->json(['message' => 'Quiz set deleted successfully']);
    }

    public function createQuestion(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $this->validateQuestionPayload($request);

        $question = DB::transaction(function () use ($validated) {
            $question = \App\Models\Question::create([
                'quiz_set_id' => $validated['quiz_set_id'],
                'question_text' => trim($validated['question_text']),
                'explanation' => $validated['explanation'] ?? null,
                'is_pretest' => $validated['is_pretest'] ?? false,
            ]);

            foreach ($validated['answers'] as $ans) {
                \App\Models\Answer::create([
                    'question_id' => $question->id,
                    'answer_text' => trim($ans['answer_text']),
                    'is_correct' => $ans['is_correct'],
                ]);
            }

            return $question->load('answers', 'quizSet.subject');
        });

        return response()->json(['message' => 'Question created successfully', 'question' => $question]);
    }

    public function updateQuestion(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $this->validateQuestionPayload($request);

        $question = DB::transaction(function () use ($id, $validated) {
            $question = \App\Models\Question::findOrFail($id);
            $question->update([
                'quiz_set_id' => $validated['quiz_set_id'],
                'question_text' => trim($validated['question_text']),
                'explanation' => $validated['explanation'] ?? null,
                'is_pretest' => $validated['is_pretest'] ?? false,
            ]);

            $question->answers()->delete();

            foreach ($validated['answers'] as $ans) {
                \App\Models\Answer::create([
                    'question_id' => $question->id,
                    'answer_text' => trim($ans['answer_text']),
                    'is_correct' => $ans['is_correct'],
                ]);
            }

            return $question->load('answers', 'quizSet.subject');
        });

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

    private function validateQuestionPayload(Request $request): array
    {
        $validated = $request->validate([
            'quiz_set_id' => 'required|exists:quiz_sets,id',
            'question_text' => 'required|string',
            'explanation' => 'nullable|string',
            'is_pretest' => 'boolean',
            'answers' => 'required|array|size:4',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ], [
            'answers.size' => 'A question must have exactly 4 answer choices.',
        ]);

        if (trim($validated['question_text']) === '') {
            throw ValidationException::withMessages([
                'question_text' => ['Question text cannot be blank.'],
            ]);
        }

        foreach ($validated['answers'] as $index => $answer) {
            if (trim($answer['answer_text']) === '') {
                throw ValidationException::withMessages([
                    "answers.$index.answer_text" => ['Answer choices cannot be blank.'],
                ]);
            }
        }

        $correctCount = collect($validated['answers'])->where('is_correct', true)->count();

        if ($correctCount !== 1) {
            throw ValidationException::withMessages([
                'answers' => ['A question must have exactly 1 correct answer.'],
            ]);
        }

        return $validated;
    }

    private function validateQuizSetPayload(Request $request, ?int $ignoreQuizSetId = null): array
    {
        $validated = $request->validate([
            'subject_id' => 'required|integer|exists:subjects,id',
            'name' => 'required|string|max:255',
            'order_index' => 'required|integer|min:1',
            'difficulty' => 'required|in:easy,average,difficult',
        ]);

        if (trim($validated['name']) === '') {
            throw ValidationException::withMessages([
                'name' => ['Quiz set name cannot be blank.'],
            ]);
        }

        $duplicateQuery = \App\Models\QuizSet::where('subject_id', $validated['subject_id'])
            ->where('order_index', $validated['order_index']);

        if ($ignoreQuizSetId) {
            $duplicateQuery->where('id', '!=', $ignoreQuizSetId);
        }

        if ($duplicateQuery->exists()) {
            throw ValidationException::withMessages([
                'order_index' => ['This subject already has a quiz set with that order.'],
            ]);
        }

        return $validated;
    }

    private function formatQuizSet(\App\Models\QuizSet $quizSet): array
    {
        return [
            'id' => $quizSet->id,
            'subject_id' => $quizSet->subject_id,
            'name' => $quizSet->name,
            'order_index' => $quizSet->order_index,
            'difficulty' => $quizSet->difficulty ?? 'average',
            'subject' => $quizSet->subject,
            'questions_count' => $quizSet->questions_count ?? $quizSet->questions()->count(),
            'is_premium' => (int) $quizSet->order_index === 3,
        ];
    }
}
