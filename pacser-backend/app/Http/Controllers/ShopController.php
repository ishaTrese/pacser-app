<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class ShopController extends Controller
{
    // Items definition
    private $items = [
        'double_xp' => ['cost' => 450, 'name' => 'Double XP Boost', 'inventory_col' => 'inventory_double_xp'],
        'streak_freeze' => ['cost' => 150, 'name' => 'Streak Freeze', 'inventory_col' => 'inventory_streak_freezes'],
        'energy_refill' => ['cost' => 180, 'name' => 'Energy Refill', 'inventory_col' => 'inventory_energy_refills'],
        'energy_plus_one' => ['cost' => 20, 'name' => 'Energy +1', 'inventory_col' => 'inventory_energy_plus_one'],
    ];

    public function purchase(Request $request)
    {
        $request->validate([
            'item_id' => 'required|string',
        ]);

        $user = $request->user();
        $itemId = $request->item_id;

        if (!array_key_exists($itemId, $this->items)) {
            return response()->json(['message' => 'Invalid item'], 400);
        }

        $cost = $this->items[$itemId]['cost'];

        if ($user->points < $cost) {
            return response()->json(['message' => 'Not enough points'], 400);
        }

        // Deduct points
        $user->points -= $cost;
        
        // Add to inventory
        $invCol = $this->items[$itemId]['inventory_col'];
        $user->$invCol += 1;
        
        $user->save();

        return response()->json([
            'message' => 'Successfully purchased ' . $this->items[$itemId]['name'],
            'user' => $user
        ]);
    }

    public function activate(Request $request)
    {
        $request->validate([
            'item_id' => 'required|string',
        ]);

        $user = $request->user();
        $itemId = $request->item_id;

        if (!array_key_exists($itemId, $this->items)) {
            return response()->json(['message' => 'Invalid item'], 400);
        }

        $invCol = $this->items[$itemId]['inventory_col'];

        if ($user->$invCol <= 0) {
            return response()->json(['message' => 'You do not own this item in your inventory'], 400);
        }

        // Apply item effects
        if ($itemId === 'double_xp') {
            $user->double_xp_until = Carbon::now()->addHours(24);
        } elseif ($itemId === 'streak_freeze') {
            if ($user->streak_freeze_active) {
                return response()->json(['message' => 'You already have an active Streak Freeze shield.'], 400);
            }
            $user->streak_freeze_active = true;
        } elseif ($itemId === 'energy_refill') {
            // Hard limit energy to 20
            if ($user->energy >= 20) {
                return response()->json(['message' => 'Energy is already at absolute maximum (20).'], 400);
            }
            $user->energy = min($user->energy + $user->max_energy, 20);
        } elseif ($itemId === 'energy_plus_one') {
            if ($user->energy >= 20) {
                return response()->json(['message' => 'Energy is already at absolute maximum (20).'], 400);
            }
            $user->energy = min($user->energy + 1, 20);
        }

        // Decrement inventory
        $user->$invCol -= 1;
        $user->save();

        return response()->json([
            'message' => 'Successfully activated ' . $this->items[$itemId]['name'],
            'user' => $user
        ]);
    }
}
