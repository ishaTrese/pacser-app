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
            $table->integer('xp')->default(0);
            $table->integer('points')->default(0);
            $table->integer('energy')->default(20);
            $table->integer('max_energy')->default(20);
            $table->integer('streak')->default(0);
            $table->date('last_login_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['xp', 'points', 'energy', 'max_energy', 'streak', 'last_login_date']);
        });
    }
};
