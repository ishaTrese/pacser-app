<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;
use App\Jobs\EvaluateWeeklyRanks;
use App\Jobs\GenerateDailyMissions;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::job(new EvaluateWeeklyRanks)->weeklyOn(0, '23:59'); // Sunday 11:59 PM
Schedule::job(new GenerateDailyMissions)->daily(); // Midnight daily
