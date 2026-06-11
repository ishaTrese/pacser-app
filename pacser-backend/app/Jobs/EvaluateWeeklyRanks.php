<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\RankHistory;
use App\Models\Notification;
use App\Models\WeeklyLeagueReward;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class EvaluateWeeklyRanks implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $weekStart = now()->startOfWeek();

        // 8 Ranks in total
        for ($rankId = 1; $rankId <= 8; $rankId++) {
            $usersInRank = User::where('rank_id', $rankId)
                               ->orderByDesc('weekly_xp')
                               ->orderBy('id')
                               ->get();

            $totalUsers = $usersInRank->count();
            if ($totalUsers === 0) continue;

            $promotionCount = (int) floor($totalUsers * 0.2);
            $demotionCount = (int) floor($totalUsers * 0.2);

            foreach ($usersInRank as $index => $user) {
                DB::transaction(function () use ($user, $index, $promotionCount, $demotionCount, $totalUsers, $weekStart) {
                    $lockedUser = User::whereKey($user->id)->lockForUpdate()->first();

                    if (!$lockedUser) {
                        return;
                    }

                    $alreadyEvaluated = RankHistory::where('user_id', $lockedUser->id)
                        ->where('week_start_date', $weekStart)
                        ->exists();

                    if ($alreadyEvaluated) {
                        return;
                    }

                    $oldRank = $lockedUser->rank_id;
                    $newRank = $oldRank;
                    $status = 'retained';

                    if ($index < $promotionCount && $oldRank < 8) {
                        $newRank = $oldRank + 1;
                        $status = 'promoted';
                    } elseif ($index >= ($totalUsers - $demotionCount) && $oldRank > 1) {
                        $newRank = $oldRank - 1;
                        $status = 'demoted';
                    }

                    // Passive Perks application for items
                    // Supervisor (4): 1 free energy
                    // Director (5): 2 free energy
                    // Secretary (6): 1 free streak freeze
                    if ($newRank == 4) {
                        $lockedUser->inventory_energy_refills += 1;
                    } elseif ($newRank == 5) {
                        $lockedUser->inventory_energy_refills += 2;
                    } elseif ($newRank >= 6) {
                        // Secretary, Commissioner, Champion get at least 1 freeze
                        // The requirement says "Secretary: 1 free Streak Freeze per week"
                        // Champion gets "all perks permanently unlocked", let's give them 1 freeze too
                        $lockedUser->inventory_streak_freezes += 1;
                    }

                    $rankHistory = RankHistory::create([
                        'user_id' => $lockedUser->id,
                        'old_rank_id' => $oldRank,
                        'new_rank_id' => $newRank,
                        'weekly_xp' => $lockedUser->weekly_xp,
                        'status' => $status,
                        'week_start_date' => $weekStart
                    ]);

                    if (in_array($status, ['promoted', 'demoted'], true)) {
                        Notification::create([
                            'user_id' => $lockedUser->id,
                            'message' => $this->rankMovementMessage($rankHistory),
                            'is_read' => false,
                        ]);
                    }

                    $lockedUser->rank_id = $newRank;
                    $lockedUser->weekly_xp = 0;
                    $lockedUser->save();
                });
            }

            $this->grantWeeklyLeagueRewards($rankId, $weekStart);
        }
    }

    private function grantWeeklyLeagueRewards(int $rankId, $weekStart): void
    {
        $rankHistories = RankHistory::where('old_rank_id', $rankId)
            ->where('week_start_date', $weekStart)
            ->orderByDesc('weekly_xp')
            ->orderBy('user_id')
            ->get();

        if ($rankHistories->count() < 5) {
            return;
        }

        $rankHistories->take(3)->values()->each(function ($history, $index) use ($rankId, $weekStart) {
            $placement = $index + 1;
            $reward = $this->weeklyRewardForPlacement($placement);

            if (!$reward) {
                return;
            }

            DB::transaction(function () use ($history, $rankId, $weekStart, $placement, $reward) {
                $lockedUser = User::whereKey($history->user_id)->lockForUpdate()->first();

                if (!$lockedUser) {
                    return;
                }

                $existingReward = WeeklyLeagueReward::where('user_id', $lockedUser->id)
                    ->where('week_start_date', $weekStart)
                    ->lockForUpdate()
                    ->first();

                if ($existingReward) {
                    return;
                }

                WeeklyLeagueReward::create([
                    'user_id' => $lockedUser->id,
                    'rank_id' => $rankId,
                    'week_start_date' => $weekStart,
                    'placement' => $placement,
                    'reward_tier' => $reward['tier'],
                    'badge_awarded' => $reward['badge'],
                    'points_awarded' => $reward['points'],
                    'inventory_rewards' => $reward['inventory'],
                ]);

                Notification::create([
                    'user_id' => $lockedUser->id,
                    'message' => $this->weeklyRewardMessage($placement),
                    'is_read' => false,
                ]);

                $lockedUser->points += $reward['points'];
                $lockedUser->inventory_energy_plus_one += $reward['inventory']['inventory_energy_plus_one'] ?? 0;
                $lockedUser->inventory_energy_refills += $reward['inventory']['inventory_energy_refills'] ?? 0;
                $lockedUser->inventory_double_xp += $reward['inventory']['inventory_double_xp'] ?? 0;
                $lockedUser->save();
            });
        });
    }

    private function weeklyRewardForPlacement(int $placement): ?array
    {
        return match ($placement) {
            1 => [
                'tier' => 'gold',
                'badge' => 'Weekly Topnotcher',
                'points' => 100,
                'inventory' => [
                    'inventory_energy_refills' => 1,
                    'inventory_double_xp' => 1,
                ],
            ],
            2 => [
                'tier' => 'silver',
                'badge' => null,
                'points' => 50,
                'inventory' => [
                    'inventory_energy_refills' => 1,
                ],
            ],
            3 => [
                'tier' => 'bronze',
                'badge' => null,
                'points' => 25,
                'inventory' => [
                    'inventory_energy_plus_one' => 1,
                ],
            ],
            default => null,
        };
    }

    private function weeklyRewardMessage(int $placement): string
    {
        return match ($placement) {
            1 => 'You earned a Gold Chest for placing #1 in your weekly league: +100 points, Energy Refill, Double XP, and Weekly Topnotcher.',
            2 => 'You earned a Silver Chest for placing #2 in your weekly league: +50 points and Energy Refill.',
            3 => 'You earned a Bronze Chest for placing #3 in your weekly league: +25 points and Energy +1.',
            default => 'You earned a weekly league reward.',
        };
    }

    private function rankMovementMessage(RankHistory $history): string
    {
        $rankNames = $this->rankNames();
        $oldRank = $rankNames[(int) $history->old_rank_id] ?? 'Applicant';
        $newRank = $rankNames[(int) $history->new_rank_id] ?? 'Applicant';

        if ($history->status === 'promoted') {
            return "You were promoted from {$oldRank} to {$newRank} after this week's league result.";
        }

        return "You were demoted from {$oldRank} to {$newRank} after this week's league result.";
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
}
