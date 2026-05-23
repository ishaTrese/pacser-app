<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class ShopController extends Controller
{
    public function purchase(Request $request)
    {
        $request->validate([
            'item_id' => 'required|string',
        ]);

        $user = $request->user();
        $itemId = $request->item_id;

        // Define items and their costs
        $items = [
            'double_xp' => ['cost' => 450, 'name' => 'Double XP Boost'],
            'streak_freeze' => ['cost' => 150, 'name' => 'Streak Freeze'],
            'energy_refill' => ['cost' => 180, 'name' => 'Energy Refill'],
            'energy_plus_one' => ['cost' => 20, 'name' => 'Energy +1'],
        ];

        if (!array_key_exists($itemId, $items)) {
            return response()->json(['message' => 'Invalid item'], 400);
        }

        $cost = $items[$itemId]['cost'];

        if ($user->points < $cost) {
            return response()->json(['message' => 'Not enough points'], 400);
        }

        // Apply item effects
        if ($itemId === 'double_xp') {
            $user->double_xp_until = Carbon::now()->addHours(24);
        } elseif ($itemId === 'streak_freeze') {
            $user->streak_freezes += 1;
        } elseif ($itemId === 'energy_refill') {
            if ($user->energy >= $user->max_energy) {
                return response()->json(['message' => 'Energy is already full'], 400);
            }
            $user->energy = $user->max_energy;
        } elseif ($itemId === 'energy_plus_one') {
            if ($user->energy >= $user->max_energy) {
                return response()->json(['message' => 'Energy is already full'], 400);
            }
            $user->energy += 1;
        }

        // Deduct points
        $user->points -= $cost;
        $user->save();

        return response()->json([
            'message' => 'Successfully purchased ' . $items[$itemId]['name'],
            'user' => $user
        ]);
    }
}
