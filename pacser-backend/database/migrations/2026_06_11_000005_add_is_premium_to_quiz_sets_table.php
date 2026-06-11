<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_sets', function (Blueprint $table) {
            $table->boolean('is_premium')->default(false)->after('difficulty');
        });

        DB::table('quiz_sets')
            ->where('order_index', 3)
            ->update(['is_premium' => true]);
    }

    public function down(): void
    {
        Schema::table('quiz_sets', function (Blueprint $table) {
            $table->dropColumn('is_premium');
        });
    }
};
