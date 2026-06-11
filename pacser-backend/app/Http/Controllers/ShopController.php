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
            return response()->json([
                'message' => 'Not enough points to purchase ' . $this->items[$itemId]['name'] . '.',
                'item' => $this->formatItem($itemId),
                'shop_status' => $this->shopStatus($user),
            ], 400);
        }

        // Deduct points
        $user->points -= $cost;
        
        // Add to inventory
        $invCol = $this->items[$itemId]['inventory_col'];
        $user->$invCol += 1;
        
        $user->save();

        return response()->json([
            'message' => 'Successfully purchased ' . $this->items[$itemId]['name'],
            'item' => $this->formatItem($itemId),
            'shop_status' => $this->shopStatus($user),
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
            return response()->json([
                'message' => 'You do not own ' . $this->items[$itemId]['name'] . ' in your inventory.',
                'item' => $this->formatItem($itemId),
                'shop_status' => $this->shopStatus($user),
            ], 400);
        }

        // Apply item effects
        if ($itemId === 'double_xp') {
            if ($user->double_xp_until && Carbon::parse($user->double_xp_until)->isFuture()) {
                return response()->json([
                    'message' => 'Double XP is already active. Wait until it expires before activating another boost.',
                    'item' => $this->formatItem($itemId),
                    'shop_status' => $this->shopStatus($user),
                ], 400);
            }

            $user->double_xp_until = Carbon::now()->addHours(24);
        } elseif ($itemId === 'streak_freeze') {
            if ($user->streak_freeze_active) {
                return response()->json([
                    'message' => 'Streak Freeze is already active. It will protect your next eligible missed study day.',
                    'item' => $this->formatItem($itemId),
                    'shop_status' => $this->shopStatus($user),
                ], 400);
            }
            $user->streak_freeze_active = true;
        } elseif ($itemId === 'energy_refill') {
            $energyCap = $this->energyCap($user);

            if ($user->energy >= $energyCap) {
                return response()->json([
                    'message' => 'Energy is already full.',
                    'item' => $this->formatItem($itemId),
                    'shop_status' => $this->shopStatus($user),
                ], 400);
            }

            $user->energy = min($user->energy + $user->max_energy, $energyCap);
        } elseif ($itemId === 'energy_plus_one') {
            $energyCap = $this->energyCap($user);

            if ($user->energy >= $energyCap) {
                return response()->json([
                    'message' => 'Energy is already full.',
                    'item' => $this->formatItem($itemId),
                    'shop_status' => $this->shopStatus($user),
                ], 400);
            }

            $user->energy = min($user->energy + 1, $energyCap);
        }

        // Decrement inventory
        $user->$invCol -= 1;
        $user->save();

        return response()->json([
            'message' => 'Successfully activated ' . $this->items[$itemId]['name'],
            'item' => $this->formatItem($itemId),
            'shop_status' => $this->shopStatus($user),
            'user' => $user
        ]);
    }

    private function formatItem(string $itemId): array
    {
        return [
            'id' => $itemId,
            'name' => $this->items[$itemId]['name'],
            'cost' => $this->items[$itemId]['cost'],
        ];
    }

    private function shopStatus($user): array
    {
        $doubleXpUntil = $user->double_xp_until ? Carbon::parse($user->double_xp_until) : null;

        return [
            'points' => (int) $user->points,
            'energy' => (int) $user->energy,
            'max_energy' => $this->energyCap($user),
            'inventory' => [
                'inventory_double_xp' => (int) $user->inventory_double_xp,
                'inventory_streak_freezes' => (int) $user->inventory_streak_freezes,
                'inventory_energy_refills' => (int) $user->inventory_energy_refills,
                'inventory_energy_plus_one' => (int) $user->inventory_energy_plus_one,
            ],
            'active' => [
                'double_xp_active' => $doubleXpUntil ? $doubleXpUntil->isFuture() : false,
                'double_xp_until' => $doubleXpUntil ? $doubleXpUntil->toDateTimeString() : null,
                'streak_freeze_active' => (bool) $user->streak_freeze_active,
            ],
        ];
    }

    private function energyCap($user): int
    {
        return min((int) $user->max_energy, 20);
    }
}
