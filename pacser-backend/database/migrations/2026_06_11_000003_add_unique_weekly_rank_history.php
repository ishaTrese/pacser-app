<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('rank_histories')
            ->select('user_id', DB::raw('DATE(week_start_date) as week_date'), DB::raw('MIN(id) as keep_id'))
            ->groupBy('user_id', DB::raw('DATE(week_start_date)'))
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->each(function ($duplicateGroup) {
                DB::table('rank_histories')
                    ->where('user_id', $duplicateGroup->user_id)
                    ->whereDate('week_start_date', $duplicateGroup->week_date)
                    ->where('id', '!=', $duplicateGroup->keep_id)
                    ->delete();
            });

        Schema::table('rank_histories', function (Blueprint $table) {
            $table->unique(['user_id', 'week_start_date'], 'rank_histories_user_week_unique');
        });
    }

    public function down(): void
    {
        Schema::table('rank_histories', function (Blueprint $table) {
            $table->dropUnique('rank_histories_user_week_unique');
        });
    }
};
