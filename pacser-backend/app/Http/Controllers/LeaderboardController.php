<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $rankNames = $this->rankNames();

        // Fetch users in the same rank
        $usersInRank = User::where('rank_id', $user->rank_id)
            ->orderByDesc('weekly_xp')
            ->orderBy('id')
            ->select('id', 'first_name', 'last_name', 'weekly_xp', 'xp', 'points', 'streak', 'role', 'rank_id')
            ->get();

        $totalUsers = $usersInRank->count();
        $promotionCount = (int) floor($totalUsers * 0.2);
        $demotionCount = (int) floor($totalUsers * 0.2);
        $promotionCutoffPosition = $promotionCount > 0 ? $promotionCount : null;
        $demotionCutoffPosition = $demotionCount > 0 ? $totalUsers - $demotionCount + 1 : null;
        $positionIndex = $usersInRank->search(fn ($rankedUser) => (int) $rankedUser->id === (int) $user->id);
        $currentUserPosition = $positionIndex === false ? null : $positionIndex + 1;
        $promotionStatus = $this->promotionStatus(
            $currentUserPosition,
            $promotionCount,
            $demotionCutoffPosition,
            (int) $user->rank_id
        );
        $nextUser = $positionIndex !== false && $positionIndex > 0
            ? $usersInRank[$positionIndex - 1]
            : null;
        $xpToNextUser = $nextUser
            ? max(1, ((int) $nextUser->weekly_xp - (int) $user->weekly_xp) + 1)
            : null;

        $weeklyRows = $usersInRank->values()->map(function ($rankedUser, $index) use (
            $rankNames,
            $promotionCount,
            $demotionCutoffPosition
        ) {
            $position = $index + 1;
            $rankId = (int) $rankedUser->rank_id;

            return [
                'id' => (int) $rankedUser->id,
                'first_name' => $rankedUser->first_name,
                'last_name' => $rankedUser->last_name,
                'name' => trim($rankedUser->first_name . ' ' . $rankedUser->last_name),
                'xp' => (int) $rankedUser->xp,
                'weekly_xp' => (int) $rankedUser->weekly_xp,
                'points' => (int) ($rankedUser->points ?? 0),
                'level' => $this->levelFromXp((int) $rankedUser->xp),
                'streak' => (int) $rankedUser->streak,
                'role' => $rankedUser->role,
                'rank_id' => $rankId,
                'rank_name' => $rankNames[$rankId] ?? 'Applicant',
                'position' => $position,
                'zone_status' => $this->promotionStatus($position, $promotionCount, $demotionCutoffPosition, $rankId),
            ];
        });

        // Fetch all-time top users
        $allTimeUsers = User::orderBy('xp', 'desc')
            ->orderBy('id')
            ->take(20)
            ->select('id', 'first_name', 'last_name', 'weekly_xp', 'xp', 'points', 'streak', 'role', 'rank_id')
            ->get()
            ->values()
            ->map(function ($rankedUser, $index) use ($rankNames) {
                $rankId = (int) $rankedUser->rank_id;

                return [
                    'id' => (int) $rankedUser->id,
                    'first_name' => $rankedUser->first_name,
                    'last_name' => $rankedUser->last_name,
                    'name' => trim($rankedUser->first_name . ' ' . $rankedUser->last_name),
                    'xp' => (int) $rankedUser->xp,
                    'weekly_xp' => (int) $rankedUser->weekly_xp,
                    'points' => (int) ($rankedUser->points ?? 0),
                    'level' => $this->levelFromXp((int) $rankedUser->xp),
                    'streak' => (int) $rankedUser->streak,
                    'role' => $rankedUser->role,
                    'rank_id' => $rankId,
                    'rank_name' => $rankNames[$rankId] ?? 'Applicant',
                    'position' => $index + 1,
                    'zone_status' => null,
                ];
            });
        $allTimePosition = User::where(function ($query) use ($user) {
                $query->where('xp', '>', $user->xp)
                    ->orWhere(function ($tieQuery) use ($user) {
                        $tieQuery->where('xp', $user->xp)
                            ->where('id', '<', $user->id);
                    });
            })
            ->count() + 1;
        $allTimeCurrentUser = $this->formatAllTimeCurrentUser($user, $rankNames, $allTimePosition);

        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();
        $smallLeagueMessage = ($promotionCount === 0 && $demotionCount === 0)
            ? 'Promotion and demotion zones open when this league has at least 5 users.'
            : null;

        return response()->json([
            'leaderboard' => $weeklyRows,
            'all_time_leaderboard' => $allTimeUsers,
            'all_time_current_user' => $allTimeCurrentUser,
            'current_user_rank' => (int) $user->rank_id,
            'weekly_league' => [
                'rank_id' => (int) $user->rank_id,
                'rank_name' => $rankNames[$user->rank_id] ?? 'Applicant',
                'current_user_position' => $currentUserPosition,
                'total_users' => $totalUsers,
                'weekly_xp' => (int) $user->weekly_xp,
                'promotion_cutoff_position' => $promotionCutoffPosition,
                'demotion_cutoff_position' => $demotionCutoffPosition,
                'promotion_status' => $promotionStatus,
                'xp_to_next_user' => $xpToNextUser,
                'next_user' => $nextUser ? [
                    'id' => (int) $nextUser->id,
                    'name' => trim($nextUser->first_name . ' ' . substr($nextUser->last_name, 0, 1) . '.'),
                    'weekly_xp' => (int) $nextUser->weekly_xp,
                ] : null,
                'week_start' => $weekStart->toDateString(),
                'week_end' => $weekEnd->toDateString(),
                'small_league_message' => $smallLeagueMessage,
            ],
        ]);
    }

    private function promotionStatus(?int $position, int $promotionCount, ?int $demotionCutoffPosition, int $rankId): string
    {
        if ($position && $promotionCount > 0 && $position <= $promotionCount && $rankId < 8) {
            return 'promotion_zone';
        }

        if ($position && $demotionCutoffPosition && $position >= $demotionCutoffPosition && $rankId > 1) {
            return 'demotion_zone';
        }

        return 'safe_zone';
    }

    private function rankNames(): array
    {
        return [
            1 => 'Applicant',
            2 => 'Clerk',
            3 => 'Officer',
            4 => 'Supervisor',
            5 => 'Director',
            6 => 'Secretary',
            7 => 'Commissioner',
            8 => 'Civil Service Champion',
        ];
    }

    private function formatAllTimeCurrentUser(User $user, array $rankNames, int $position): array
    {
        $rankId = (int) $user->rank_id;

        return [
            'position' => $position,
            'id' => (int) $user->id,
            'name' => trim($user->first_name . ' ' . $user->last_name),
            'xp' => (int) $user->xp,
            'points' => (int) ($user->points ?? 0),
            'level' => $this->levelFromXp((int) $user->xp),
            'rank_id' => $rankId,
            'rank_name' => $rankNames[$rankId] ?? 'Applicant',
            'streak' => (int) $user->streak,
        ];
    }

    private function levelFromXp(int $xp): int
    {
        return max(1, (int) floor($xp / 100) + 1);
    }
}
