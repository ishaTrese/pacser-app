<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Fetch users in the same rank
        $usersInRank = User::where('rank_id', $user->rank_id)
            ->orderBy('weekly_xp', 'desc')
            ->select('id', 'first_name', 'last_name', 'weekly_xp', 'xp', 'streak', 'role', 'rank_id')
            ->get();

        // Fetch all-time top users
        $allTimeUsers = User::orderBy('xp', 'desc')
            ->take(20)
            ->select('id', 'first_name', 'last_name', 'xp', 'streak', 'role', 'rank_id')
            ->get();

        return response()->json([
            'leaderboard' => $usersInRank,
            'all_time_leaderboard' => $allTimeUsers,
            'current_user_rank' => $user->rank_id
        ]);
    }
}
