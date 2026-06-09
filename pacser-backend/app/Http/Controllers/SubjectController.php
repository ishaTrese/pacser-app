<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function getQuizSets(Request $request, $slug)
    {
        $subject = Subject::where('slug', $slug)->firstOrFail();
        $user = $request->user();
        
        // Fetch quiz sets with basic details
        $quizSets = $subject->quizSets()->orderBy('order_index')->get();
        
        // For iteration 2, we will just return them.
        // We will mock the questions count or time later, or fetch it.
        $mapped = $quizSets->map(function ($set) use ($user) {
            $isPremiumSet = $set->order_index == 3;
            $status = ($isPremiumSet && !$user->is_premium) ? 'locked' : 'available';

            return [
                'id' => $set->id,
                'title' => $set->name,
                'questions' => $set->questions()->count(),
                'time' => '30 mins', // Default
                'status' => $status,
                'is_premium' => $isPremiumSet,
                'score' => null
            ];
        });

        return response()->json([
            'subject' => $subject,
            'quiz_sets' => $mapped
        ]);
    }
}
