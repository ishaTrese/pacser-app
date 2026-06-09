<?php

namespace App\Http\Controllers;

use App\Models\AccessCode;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function profileStats(Request $request)
    {
        $user = $request->user();

        // Calculate dynamic stats
        $totalLessons = $user->quizLogs()->distinct('quiz_set_id')->count();
        $totalQuizzesTaken = $user->quizLogs()->count();

        $totalScore = $user->quizLogs()->sum('score');
        $totalItems = $user->quizLogs()->sum('total');
        $accuracy = $totalItems > 0 ? round(($totalScore / $totalItems) * 100) : 0;

        // Check for 80% score or higher on any quiz
        $hasHighScore = $user->quizLogs()->whereRaw('(score / total) >= 0.8')->exists();

        // Check if completed all sets in one subject (3 sets)
        // This is a simplified check: grouping quiz logs by subject_id (via quiz_set)
        $completedAllInOne = false;
        // Optimization: For now we'll just check if they completed at least 3 distinct quiz sets in the same subject.
        $subjectCounts = $user->quizLogs()
            ->join('quiz_sets', 'quiz_logs.quiz_set_id', '=', 'quiz_sets.id')
            ->select('quiz_sets.subject_id', \DB::raw('count(distinct quiz_set_id) as set_count'))
            ->groupBy('quiz_sets.subject_id')
            ->get();

        foreach($subjectCounts as $sc) {
            if ($sc->set_count >= 3) {
                $completedAllInOne = true;
                break;
            }
        }

        // Calculate Level (using the same formula as frontend: Math.floor(0.1 * Math.sqrt(xp)) + 1)
        $level = floor(0.1 * sqrt($user->xp)) + 1;

        // Compute Badges based on user stats
        $badges = [
            [ 'id' => 1, 'name' => 'First Quiz', 'earned' => $totalQuizzesTaken > 0 ],
            [ 'id' => 2, 'name' => '3-Day Streak', 'earned' => $user->streak >= 3 ],
            [ 'id' => 3, 'name' => '7-Day Streak', 'earned' => $user->streak >= 7 ],
            [ 'id' => 4, 'name' => 'Subject Master', 'earned' => $completedAllInOne ],
            [ 'id' => 5, 'name' => 'Top Scorer', 'earned' => $hasHighScore ],
            [ 'id' => 6, 'name' => 'Level 5', 'earned' => $level >= 5 ],
            [ 'id' => 7, 'name' => 'Mock Exam Complete', 'earned' => $user->mock_exam_completed ],
            [ 'id' => 8, 'name' => 'Premium', 'earned' => $user->is_premium ],
        ];

        // Rank Name mapping
        $rankNames = [
            1 => 'Applicant',
            2 => 'Clerk',
            3 => 'Officer',
            4 => 'Supervisor',
            5 => 'Director',
            6 => 'Secretary',
            7 => 'Commissioner',
            8 => 'Civil Service Champion',
        ];
        $rank = $rankNames[$user->rank_id] ?? 'Applicant';

        return response()->json([
            'stats' => [
                'total_lessons' => $totalLessons,
                'accuracy' => $accuracy,
                'streak' => $user->streak,
                'mock_exams_taken' => $user->mock_exam_completed ? 1 : 0, // Mock for now
                'rank' => $rank,
            ],
            'badges' => $badges,
            'user' => $user
        ]);
    }

    public function updateAccount(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email' => 'required|email|unique:users,email,'.$user->id,
            'password' => 'nullable|min:6'
        ]);

        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        return response()->json(['message' => 'Account updated successfully', 'user' => $user]);
    }

    public function redeemCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $codeStr = strtoupper(trim($request->code));
        $accessCode = AccessCode::where('code', $codeStr)->first();

        if (!$accessCode) {
            return response()->json(['message' => 'Invalid access code.'], 400);
        }

        if ($accessCode->is_used) {
            return response()->json(['message' => 'This access code has already been redeemed.'], 400);
        }

        $user = $request->user();
        if ($user->is_premium) {
            return response()->json(['message' => 'You are already a premium member.'], 400);
        }

        // Redeem the code
        $accessCode->is_used = true;
        $accessCode->used_by = $user->id;
        $accessCode->used_at = now();
        $accessCode->save();

        $user->is_premium = true;
        $user->save();

        // Create Notification
        Notification::create([
            'user_id' => $user->id,
            'message' => 'Congratulations! You have successfully redeemed a code and unlocked Premium access.',
            'is_read' => false
        ]);

        return response()->json([
            'message' => 'Code redeemed successfully! You are now a Premium user.',
            'user' => $user
        ]);
    }
}
