<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateDailyMissions;
use App\Models\UserMission;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->toDateString();
        $user = $request->user();

        GenerateDailyMissions::ensureForUser($user, $today);

        $missions = UserMission::where('user_id', $user->id)
                               ->where('date', $today)
                               ->get();

        return response()->json(['missions' => $missions]);
    }

    public function claim(Request $request, $id)
    {
        $user = $request->user();
        $mission = UserMission::where('user_id', $user->id)->findOrFail($id);

        if (!$mission->is_completed) {
            return response()->json(['message' => 'Mission not completed yet'], 400);
        }

        if ($mission->is_claimed) {
            return response()->json(['message' => 'Mission already claimed'], 400);
        }

        $mission->is_claimed = true;
        $mission->save();

        $user->points += $mission->points_reward;
        $user->save();

        return response()->json([
            'message' => 'Reward claimed successfully',
            'points_awarded' => $mission->points_reward,
            'mission' => $mission,
            'user' => $user
        ]);
    }
}
