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
            'is_premium' => $validated['is_premium'] ?? false,
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
            'is_premium' => $validated['is_premium'] ?? false,
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

    public function getAccessCodes(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'nullable|in:available,used,disabled',
            'search' => 'nullable|string|max:255',
        ]);

        $query = \App\Models\AccessCode::with('usedBy')
            ->when($validated['status'] ?? null, function ($query, $status) {
                if ($status === 'available') {
                    $query->where('is_used', false)->whereNull('disabled_at');
                } elseif ($status === 'used') {
                    $query->where('is_used', true);
                } elseif ($status === 'disabled') {
                    $query->whereNotNull('disabled_at');
                }
            })
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%");
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($accessCode) => $this->formatAccessCode($accessCode));

        return response()->json([
            'access_codes' => $query,
        ]);
    }

    public function createAccessCode(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:access_codes,code',
        ]);

        $code = strtoupper(trim($validated['code']));

        if ($code === '') {
            throw ValidationException::withMessages([
                'code' => ['Access code cannot be blank.'],
            ]);
        }

        if (\App\Models\AccessCode::where('code', $code)->exists()) {
            throw ValidationException::withMessages([
                'code' => ['This access code already exists.'],
            ]);
        }

        $accessCode = \App\Models\AccessCode::create([
            'code' => $code,
            'is_used' => false,
            'disabled_at' => null,
        ]);

        return response()->json([
            'message' => 'Access code created successfully.',
            'access_code' => $this->formatAccessCode($accessCode->load('usedBy')),
        ], 201);
    }

    public function updateAccessCode(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $accessCode = \App\Models\AccessCode::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:255',
            'disabled' => 'sometimes|boolean',
        ]);

        if (array_key_exists('code', $validated)) {
            if ($accessCode->is_used) {
                return response()->json([
                    'message' => 'Used access codes cannot be edited.',
                ], 422);
            }

            $code = strtoupper(trim($validated['code']));

            if ($code === '') {
                throw ValidationException::withMessages([
                    'code' => ['Access code cannot be blank.'],
                ]);
            }

            $exists = \App\Models\AccessCode::where('code', $code)
                ->where('id', '!=', $accessCode->id)
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'code' => ['This access code already exists.'],
                ]);
            }

            $accessCode->code = $code;
        }

        if (array_key_exists('disabled', $validated)) {
            $accessCode->disabled_at = $validated['disabled'] ? now() : null;
        }

        $accessCode->save();

        return response()->json([
            'message' => 'Access code updated successfully.',
            'access_code' => $this->formatAccessCode($accessCode->load('usedBy')),
        ]);
    }

    public function deleteAccessCode(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $accessCode = \App\Models\AccessCode::findOrFail($id);

        if ($accessCode->is_used) {
            return response()->json([
                'message' => 'Used access codes cannot be deleted.',
            ], 422);
        }

        $accessCode->delete();

        return response()->json(['message' => 'Access code deleted successfully.']);
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

    public function importQuestionsPreview(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rows = $this->readQuestionImportCsv($request);
        $plan = $this->buildQuestionImportPlan($rows);

        return response()->json($this->formatQuestionImportPlan($plan));
    }

    public function importQuestions(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rows = $this->readQuestionImportCsv($request);
        $plan = $this->buildQuestionImportPlan($rows);

        if (count($plan['row_errors']) > 0) {
            return response()->json([
                'message' => 'Import has validation errors. Run preview and fix the CSV before importing.',
                'summary' => $this->formatQuestionImportPlan($plan),
            ], 422);
        }

        $result = DB::transaction(function () use ($plan) {
            $createdQuizSets = [];
            $quizSetCache = [];
            $importedCount = 0;

            foreach ($plan['quiz_sets_to_create'] as $quizSetData) {
                $quizSet = \App\Models\QuizSet::create([
                    'subject_id' => $quizSetData['subject_id'],
                    'name' => $quizSetData['name'],
                    'order_index' => $quizSetData['order_index'],
                    'difficulty' => $quizSetData['difficulty'],
                ]);

                $quizSetCache[$quizSetData['cache_key']] = $quizSet->id;
                $createdQuizSets[] = $this->formatQuizSet($quizSet->load('subject')->loadCount('questions'));
            }

            foreach ($plan['questions_to_create'] as $questionData) {
                $quizSetId = $questionData['quiz_set_id'] ?? $quizSetCache[$questionData['quiz_set_cache_key']] ?? null;

                if (!$quizSetId) {
                    continue;
                }

                $question = \App\Models\Question::create([
                    'quiz_set_id' => $quizSetId,
                    'question_text' => $questionData['question_text'],
                    'explanation' => $questionData['explanation'],
                    'is_pretest' => $questionData['is_pretest'],
                ]);

                foreach ($questionData['answers'] as $answerData) {
                    \App\Models\Answer::create([
                        'question_id' => $question->id,
                        'answer_text' => $answerData['answer_text'],
                        'is_correct' => $answerData['is_correct'],
                    ]);
                }

                $importedCount++;
            }

            return [
                'imported_count' => $importedCount,
                'skipped_duplicate_count' => count($plan['questions_to_skip']),
                'created_quiz_sets' => $createdQuizSets,
            ];
        });

        return response()->json([
            'message' => 'Question import completed.',
            'imported_count' => $result['imported_count'],
            'skipped_duplicate_count' => $result['skipped_duplicate_count'],
            'created_quiz_sets' => $result['created_quiz_sets'],
            'row_errors' => [],
        ]);
    }

    public function exportQuestions(Request $request)
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
        ]);

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
            ->orderBy('id');

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $this->questionImportColumns());

            $query->chunk(200, function ($questions) use ($handle) {
                foreach ($questions as $question) {
                    $answers = $question->answers->values();
                    $correctIndex = $answers->search(fn ($answer) => (bool) $answer->is_correct);

                    fputcsv($handle, [
                        $question->quizSet?->subject?->slug,
                        $question->quizSet?->order_index,
                        $question->quizSet?->name,
                        $question->quizSet?->difficulty ?? 'average',
                        $question->is_pretest ? 'true' : 'false',
                        $question->question_text,
                        $answers[0]->answer_text ?? '',
                        $answers[1]->answer_text ?? '',
                        $answers[2]->answer_text ?? '',
                        $answers[3]->answer_text ?? '',
                        $correctIndex === false ? '' : ['A', 'B', 'C', 'D'][$correctIndex] ?? '',
                        $question->explanation,
                    ]);
                }
            });

            fclose($handle);
        }, 'pacser-question-bank.csv', [
            'Content-Type' => 'text/csv',
        ]);
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

    private function readQuestionImportCsv(Request $request): array
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if (!$handle) {
            throw ValidationException::withMessages([
                'file' => ['Unable to read uploaded CSV file.'],
            ]);
        }

        $headers = fgetcsv($handle);

        if (!$headers) {
            fclose($handle);
            throw ValidationException::withMessages([
                'file' => ['CSV file is empty.'],
            ]);
        }

        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]);
        $headers = array_map(fn ($header) => trim($header), $headers);
        $expectedColumns = $this->questionImportColumns();
        $missingColumns = array_values(array_diff($expectedColumns, $headers));
        $extraColumns = array_values(array_diff($headers, $expectedColumns));

        if (count($missingColumns) > 0 || count($extraColumns) > 0 || count($headers) !== count($expectedColumns)) {
            fclose($handle);
            $errors = ['CSV headers must match the required columns exactly.'];

            if (count($missingColumns) > 0) {
                $errors[] = 'Missing columns: ' . implode(', ', $missingColumns);
            }

            if (count($extraColumns) > 0) {
                $errors[] = 'Extra columns: ' . implode(', ', $extraColumns);
            }

            return [[
                'row_number' => 1,
                'data' => [],
                'structure_errors' => $errors,
            ]];
        }

        $rows = [];
        $rowNumber = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $rowNumber++;

            if ($this->isEmptyCsvRow($data)) {
                continue;
            }

            if (count($data) !== count($headers)) {
                $rows[] = [
                    'row_number' => $rowNumber,
                    'data' => [],
                    'structure_errors' => [
                        'CSV column count does not match header count. Check for missing columns, extra columns, or broken quoted values.',
                    ],
                ];
                continue;
            }

            $row = array_combine($headers, $data);
            $rows[] = [
                'row_number' => $rowNumber,
                'data' => $row,
            ];
        }

        fclose($handle);

        return $rows;
    }

    private function buildQuestionImportPlan(array $rows): array
    {
        $subjects = \App\Models\Subject::all()->keyBy('slug');
        $existingQuizSets = \App\Models\QuizSet::with('subject')->get();
        $quizSetBySubjectOrder = [];

        foreach ($existingQuizSets as $quizSet) {
            $quizSetBySubjectOrder[$this->quizSetCacheKey($quizSet->subject_id, $quizSet->order_index)] = $quizSet;
        }

        $existingQuestionText = [];
        \App\Models\Question::select('id', 'quiz_set_id', 'question_text')
            ->get()
            ->each(function ($question) use (&$existingQuestionText) {
                $existingQuestionText[$this->quizSetDuplicateKey($question->quiz_set_id)][$this->normalizeQuestionText($question->question_text)] = true;
            });

        $rowErrors = [];
        $duplicateWarnings = [];
        $quizSetsToCreate = [];
        $questionsToCreate = [];
        $questionsToSkip = [];
        $seenImportedQuestions = [];

        foreach ($rows as $row) {
            $rowNumber = $row['row_number'];

            if (isset($row['structure_errors'])) {
                $rowErrors[] = [
                    'row' => $rowNumber,
                    'errors' => $row['structure_errors'],
                ];
                continue;
            }

            $data = array_map(fn ($value) => trim((string) $value), $row['data']);
            $errors = [];

            $subject = $subjects[$data['subject_slug'] ?? ''] ?? null;
            if (!$subject) {
                $errors[] = 'subject_slug must match an existing subject.';
            }

            $orderIndex = filter_var($data['quiz_set_order'] ?? null, FILTER_VALIDATE_INT);
            if ($orderIndex === false || $orderIndex < 1) {
                $errors[] = 'quiz_set_order must be an integer of 1 or higher.';
            }

            if (!in_array($data['difficulty'] ?? '', ['easy', 'average', 'difficult'], true)) {
                $errors[] = 'difficulty must be easy, average, or difficult.';
            }

            $isPretest = $this->parseBooleanValue($data['is_pretest'] ?? null);
            if ($isPretest === null) {
                $errors[] = 'is_pretest must be true, false, 1, 0, yes, or no.';
            }

            if (($data['question_text'] ?? '') === '') {
                $errors[] = 'question_text is required.';
            }

            foreach (['choice_a', 'choice_b', 'choice_c', 'choice_d'] as $choiceKey) {
                if (($data[$choiceKey] ?? '') === '') {
                    $errors[] = "$choiceKey is required.";
                }
            }

            $correctChoice = strtoupper($data['correct_choice'] ?? '');
            if (!in_array($correctChoice, ['A', 'B', 'C', 'D'], true)) {
                $errors[] = 'correct_choice must be A, B, C, or D.';
            }

            $quizSet = null;
            $quizSetCacheKey = null;

            if ($subject && $orderIndex !== false && $orderIndex >= 1) {
                $quizSetCacheKey = $this->quizSetCacheKey($subject->id, $orderIndex);
                $quizSet = $quizSetBySubjectOrder[$quizSetCacheKey] ?? null;

                if (!$quizSet && ($data['quiz_set_name'] ?? '') === '') {
                    $errors[] = 'quiz_set_name is required when the quiz set does not exist.';
                }

                if ($quizSet) {
                    $existingDifficulty = $quizSet->difficulty ?? 'average';
                    $csvName = $data['quiz_set_name'] ?? '';
                    $csvDifficulty = $data['difficulty'] ?? '';

                    if ($csvName !== $quizSet->name || $csvDifficulty !== $existingDifficulty) {
                        $errors[] = 'Quiz set already exists but metadata does not match existing quiz set.';
                    }
                }
            }

            if (count($errors) > 0) {
                $rowErrors[] = [
                    'row' => $rowNumber,
                    'errors' => $errors,
                ];
                continue;
            }

            if (!$quizSet && !isset($quizSetsToCreate[$quizSetCacheKey])) {
                $quizSetsToCreate[$quizSetCacheKey] = [
                    'cache_key' => $quizSetCacheKey,
                    'subject_id' => $subject->id,
                    'subject_slug' => $subject->slug,
                    'name' => $data['quiz_set_name'],
                    'order_index' => $orderIndex,
                    'difficulty' => $data['difficulty'],
                ];
            }

            $duplicateScope = $quizSet
                ? $this->quizSetDuplicateKey($quizSet->id)
                : $this->quizSetDuplicateKey($quizSetCacheKey);
            $normalizedQuestion = $this->normalizeQuestionText($data['question_text']);
            $isDuplicate = isset($existingQuestionText[$duplicateScope][$normalizedQuestion])
                || isset($seenImportedQuestions[$duplicateScope][$normalizedQuestion]);

            if ($isDuplicate) {
                $duplicate = [
                    'row' => $rowNumber,
                    'question_text' => $data['question_text'],
                    'reason' => 'Duplicate question text in the same quiz set.',
                ];
                $duplicateWarnings[] = $duplicate;
                $questionsToSkip[] = $duplicate;
                continue;
            }

            $seenImportedQuestions[$duplicateScope][$normalizedQuestion] = true;
            $answers = [
                ['answer_text' => $data['choice_a'], 'is_correct' => $correctChoice === 'A'],
                ['answer_text' => $data['choice_b'], 'is_correct' => $correctChoice === 'B'],
                ['answer_text' => $data['choice_c'], 'is_correct' => $correctChoice === 'C'],
                ['answer_text' => $data['choice_d'], 'is_correct' => $correctChoice === 'D'],
            ];

            $questionsToCreate[] = [
                'row' => $rowNumber,
                'quiz_set_id' => $quizSet?->id,
                'quiz_set_cache_key' => $quizSetCacheKey,
                'subject_slug' => $subject->slug,
                'quiz_set_order' => $orderIndex,
                'question_text' => $data['question_text'],
                'explanation' => ($data['explanation'] ?? '') === '' ? null : $data['explanation'],
                'is_pretest' => $isPretest,
                'answers' => $answers,
            ];
        }

        return [
            'row_count' => count($rows),
            'row_errors' => $rowErrors,
            'duplicate_warnings' => $duplicateWarnings,
            'quiz_sets_to_create' => array_values($quizSetsToCreate),
            'questions_to_create' => $questionsToCreate,
            'questions_to_skip' => $questionsToSkip,
        ];
    }

    private function formatQuestionImportPlan(array $plan): array
    {
        return [
            'valid_row_count' => count($plan['questions_to_create']) + count($plan['questions_to_skip']),
            'invalid_row_count' => count($plan['row_errors']),
            'row_errors' => $plan['row_errors'],
            'duplicate_warnings' => $plan['duplicate_warnings'],
            'quiz_sets_to_create' => $plan['quiz_sets_to_create'],
            'questions_to_create' => array_map(fn ($question) => [
                'row' => $question['row'],
                'subject_slug' => $question['subject_slug'],
                'quiz_set_order' => $question['quiz_set_order'],
                'question_text' => $question['question_text'],
            ], $plan['questions_to_create']),
            'questions_to_skip' => $plan['questions_to_skip'],
        ];
    }

    private function questionImportColumns(): array
    {
        return [
            'subject_slug',
            'quiz_set_order',
            'quiz_set_name',
            'difficulty',
            'is_pretest',
            'question_text',
            'choice_a',
            'choice_b',
            'choice_c',
            'choice_d',
            'correct_choice',
            'explanation',
        ];
    }

    private function isEmptyCsvRow(array $row): bool
    {
        return count(array_filter($row, fn ($value) => trim((string) $value) !== '')) === 0;
    }

    private function parseBooleanValue(?string $value): ?bool
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'true', '1', 'yes' => true,
            'false', '0', 'no' => false,
            default => null,
        };
    }

    private function normalizeQuestionText(string $text): string
    {
        return strtolower(preg_replace('/\s+/', ' ', trim($text)));
    }

    private function quizSetCacheKey(int $subjectId, int $orderIndex): string
    {
        return "{$subjectId}:{$orderIndex}";
    }

    private function quizSetDuplicateKey(int|string $quizSetKey): string
    {
        return "quiz-set:{$quizSetKey}";
    }

    private function validateQuizSetPayload(Request $request, ?int $ignoreQuizSetId = null): array
    {
        $validated = $request->validate([
            'subject_id' => 'required|integer|exists:subjects,id',
            'name' => 'required|string|max:255',
            'order_index' => 'required|integer|min:1',
            'difficulty' => 'required|in:easy,average,difficult',
            'is_premium' => 'sometimes|boolean',
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
            'is_premium' => (bool) $quizSet->is_premium,
        ];
    }

    private function formatAccessCode(\App\Models\AccessCode $accessCode): array
    {
        return [
            'id' => $accessCode->id,
            'code' => $accessCode->code,
            'is_used' => (bool) $accessCode->is_used,
            'used_by_user_id' => $accessCode->used_by,
            'used_by_name' => $accessCode->usedBy
                ? trim($accessCode->usedBy->first_name . ' ' . $accessCode->usedBy->last_name)
                : null,
            'used_at' => $accessCode->used_at,
            'created_at' => $accessCode->created_at,
            'disabled_at' => $accessCode->disabled_at,
            'status' => $accessCode->disabled_at
                ? 'disabled'
                : ((bool) $accessCode->is_used ? 'used' : 'available'),
        ];
    }
}
