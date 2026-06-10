<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subject;
use App\Models\Question;
use App\Services\StreakService;
use Illuminate\Support\Facades\DB;

class PretestController extends Controller
{
    public function __construct(private StreakService $streakService)
    {
    }

    public function getQuestions(Request $request)
    {
        $level = $this->normalizeLevel($request->query('level', 'professional'));
        $subjectSlugs = config("exam_subjects.levels.$level.subjects", []);
        $slugOrder = array_flip($subjectSlugs);

        // 10 questions per subject for the selected exam level
        $subjects = Subject::whereIn('slug', $subjectSlugs)
            ->get()
            ->sortBy(fn ($subject) => $slugOrder[$subject->slug] ?? 999)
            ->values();
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

    private function normalizeLevel(?string $level): string
    {
        $key = strtolower(trim($level ?? 'professional'));

        return config("exam_subjects.aliases.$key", 'professional');
    }

    public function submit(Request $request)
    {
        $validated = $request->validate([
            'scores' => 'required|array', // e.g. ['numerical-ability' => ['score' => 8, 'total' => 10, 'subject_id' => 1], ...]
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

        $this->streakService->recordStudyActivity($user);

        return response()->json([
            'message' => 'Pretest submitted successfully',
            'user' => $user
        ]);
    }
}
