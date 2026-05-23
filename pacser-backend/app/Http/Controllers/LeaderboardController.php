<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class LeaderboardController extends Controller
{
    public function index()
    {
        $topUsers = User::orderBy('xp', 'desc')
            ->take(10)
            ->select('id', 'first_name', 'last_name', 'xp', 'streak', 'role')
            ->get();
            
        return response()->json([
            'leaderboard' => $topUsers
        ]);
    }
}
