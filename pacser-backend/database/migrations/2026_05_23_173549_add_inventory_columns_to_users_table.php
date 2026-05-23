<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('inventory_double_xp')->default(0)->after('double_xp_until');
            $table->integer('inventory_streak_freezes')->default(0)->after('inventory_double_xp');
            $table->integer('inventory_energy_refills')->default(0)->after('inventory_streak_freezes');
            $table->integer('inventory_energy_plus_one')->default(0)->after('inventory_energy_refills');
            $table->boolean('streak_freeze_active')->default(false)->after('inventory_energy_plus_one');
            
            // Drop old column since we replaced it with inventory_streak_freezes
            $table->dropColumn('streak_freezes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'inventory_double_xp', 
                'inventory_streak_freezes', 
                'inventory_energy_refills', 
                'inventory_energy_plus_one',
                'streak_freeze_active'
            ]);
            $table->integer('streak_freezes')->default(0);
        });
    }
};
