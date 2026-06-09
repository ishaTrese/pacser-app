<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserMission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user  = Auth::user();

        // Gamification Logic: Daily Streak & Energy Refill
        $today = now()->startOfDay();
        $lastLogin = $user->last_login_date ? \Carbon\Carbon::parse($user->last_login_date)->startOfDay() : null;

        if (!$lastLogin || $lastLogin->lessThan($today)) {
            // Refill energy for the new day
            $user->energy = $user->max_energy;

            if ($lastLogin && $lastLogin->diffInDays($today) === 1) {
                $user->streak += 1;

                // Update maintain_streak mission
                $mission = UserMission::where('user_id', $user->id)
                                      ->where('date', $today->toDateString())
                                      ->where('mission_type', 'maintain_streak')
                                      ->first();
                if ($mission && !$mission->is_completed) {
                    $mission->progress = 1;
                    $mission->is_completed = true;
                    $mission->save();
                }
            } else {
                $user->streak = 1;
            }

            $user->last_login_date = $today->toDateString();
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}