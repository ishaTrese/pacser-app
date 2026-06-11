<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_league_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('rank_id');
            $table->timestamp('week_start_date');
            $table->integer('placement');
            $table->string('reward_tier');
            $table->string('badge_awarded')->nullable();
            $table->integer('points_awarded')->default(0);
            $table->json('inventory_rewards')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'week_start_date'], 'weekly_rewards_user_week_unique');
            $table->index(['rank_id', 'week_start_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_league_rewards');
    }
};
