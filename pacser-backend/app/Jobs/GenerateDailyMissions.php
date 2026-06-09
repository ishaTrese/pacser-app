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

        $missions = [
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

        // Process in chunks to avoid memory issues for large user bases
        User::chunk(100, function ($users) use ($missions, $today) {
            $insertData = [];
            foreach ($users as $user) {
                foreach ($missions as $mission) {
                    $insertData[] = [
                        'user_id' => $user->id,
                        'mission_type' => $mission['mission_type'],
                        'target' => $mission['target'],
                        'points_reward' => $mission['points_reward'],
                        'progress' => 0,
                        'is_completed' => false,
                        'is_claimed' => false,
                        'date' => $today,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            UserMission::insert($insertData);
        });
    }
}
