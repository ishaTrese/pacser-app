<?php

namespace App\Services;

use App\Jobs\GenerateDailyMissions;
use App\Models\User;
use App\Models\UserMission;
use Carbon\Carbon;

class StreakService
{
    public function recordStudyActivity(User $user): void
    {
        $today = now()->startOfDay();
        $lastStudy = $user->last_study_date
            ? Carbon::parse($user->last_study_date)->startOfDay()
            : null;

        if ($lastStudy && $lastStudy->equalTo($today)) {
            $this->completeMaintainStreakMission($user, $today);
            return;
        }

        if (!$lastStudy) {
            $user->streak = max(1, (int) $user->streak);
        } else {
            $daysSinceStudy = (int) $lastStudy->diffInDays($today);

            if ($daysSinceStudy === 1) {
                $user->streak += 1;
            } elseif ($daysSinceStudy === 2 && $user->streak_freeze_active) {
                $user->streak += 1;
                $user->streak_freeze_active = false;
            } else {
                $user->streak = 1;
            }
        }

        $user->last_study_date = $today->toDateString();
        $user->save();

        $this->completeMaintainStreakMission($user, $today);
    }

    private function completeMaintainStreakMission(User $user, Carbon $today): void
    {
        GenerateDailyMissions::ensureForUser($user, $today->toDateString());

        $mission = UserMission::where('user_id', $user->id)
            ->where('date', $today->toDateString())
            ->where('mission_type', 'maintain_streak')
            ->first();

        if (!$mission || $mission->is_completed) {
            return;
        }

        $mission->progress = $mission->target;
        $mission->is_completed = true;
        $mission->save();
    }
}
