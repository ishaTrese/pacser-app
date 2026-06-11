<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('access_codes', function (Blueprint $table) {
            $table->timestamp('disabled_at')->nullable()->after('used_at');
        });
    }

    public function down(): void
    {
        Schema::table('access_codes', function (Blueprint $table) {
            $table->dropColumn('disabled_at');
        });
    }
};
