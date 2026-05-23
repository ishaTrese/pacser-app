<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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
        if (isset($validated['xp'])) $user->xp = $validated['xp'];
        if (isset($validated['streak'])) $user->streak = $validated['streak'];

        $user->save();

        return response()->json([
            'message' => 'God Mode update successful',
            'user' => $user
        ]);
    }
}
