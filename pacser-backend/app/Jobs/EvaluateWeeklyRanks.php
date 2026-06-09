<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\RankHistory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EvaluateWeeklyRanks implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // 8 Ranks in total
        for ($rankId = 1; $rankId <= 8; $rankId++) {
            $usersInRank = User::where('rank_id', $rankId)
                               ->orderBy('weekly_xp', 'desc')
                               ->get();

            $totalUsers = $usersInRank->count();
            if ($totalUsers === 0) continue;

            $promotionCount = (int) floor($totalUsers * 0.2);
            $demotionCount = (int) floor($totalUsers * 0.2);

            foreach ($usersInRank as $index => $user) {
                $oldRank = $user->rank_id;
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
                    $user->inventory_energy_refills += 1;
                } elseif ($newRank == 5) {
                    $user->inventory_energy_refills += 2;
                } elseif ($newRank >= 6) {
                    // Secretary, Commissioner, Champion get at least 1 freeze
                    // The requirement says "Secretary: 1 free Streak Freeze per week"
                    // Champion gets "all perks permanently unlocked", let's give them 1 freeze too
                    $user->inventory_streak_freezes += 1;
                }

                RankHistory::create([
                    'user_id' => $user->id,
                    'old_rank_id' => $oldRank,
                    'new_rank_id' => $newRank,
                    'weekly_xp' => $user->weekly_xp,
                    'status' => $status,
                    'week_start_date' => now()->startOfWeek()
                ]);

                $user->rank_id = $newRank;
                $user->weekly_xp = 0;
                $user->save();
            }
        }
    }
}
