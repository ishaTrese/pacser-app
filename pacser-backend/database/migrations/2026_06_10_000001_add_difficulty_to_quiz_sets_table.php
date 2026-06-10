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
            $table->string('difficulty')->default('average')->after('order_index');
        });

        DB::table('quiz_sets')
            ->where('order_index', 3)
            ->update(['difficulty' => 'difficult']);
    }

    public function down(): void
    {
        Schema::table('quiz_sets', function (Blueprint $table) {
            $table->dropColumn('difficulty');
        });
    }
};
