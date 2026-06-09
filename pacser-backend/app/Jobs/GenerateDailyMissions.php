<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\UserMission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateDailyMissions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $today = now()->toDateString();

        // Process in chunks to avoid memory issues for large user bases
        User::chunk(100, function ($users) use ($today) {
            foreach ($users as $user) {
                self::ensureForUser($user, $today);
            }
        });
    }

    public static function ensureForUser(User $user, ?string $date = null): void
    {
        $date = $date ?? now()->toDateString();

        foreach (self::missionDefinitions() as $mission) {
            UserMission::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'mission_type' => $mission['mission_type'],
                    'date' => $date,
                ],
                [
                    'target' => $mission['target'],
                    'points_reward' => $mission['points_reward'],
                    'progress' => 0,
                    'is_completed' => false,
                    'is_claimed' => false,
                ]
            );
        }
    }

    public static function missionDefinitions(): array
    {
        return [
            [
                'mission_type' => 'complete_2_quiz_sets',
                'target' => 2,
                'points_reward' => 50
            ],
            [
                'mission_type' => 'score_80_percent',
                'target' => 1,
                'points_reward' => 50
            ],
            [
                'mission_type' => 'earn_100_xp',
                'target' => 100,
                'points_reward' => 50
            ],
            [
                'mission_type' => 'maintain_streak',
                'target' => 1,
                'points_reward' => 30
            ]
        ];
    }
}
