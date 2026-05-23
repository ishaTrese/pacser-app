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
            $table->boolean('pretest_completed')->default(false)->after('streak_freeze_active');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->boolean('is_pretest')->default(false)->after('quiz_set_id');
        });

        Schema::create('pretest_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->integer('score');
            $table->integer('total');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pretest_scores');

        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('is_pretest');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pretest_completed');
        });
    }
};
