<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccessCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $codes = [
            'PACSER-PREMIUM',
            'CHQ-ACCESS-2026',
            'INSIGNIA-2026',
            'PACSER-TEST01',
            'PACSER-TEST02'
        ];

        foreach ($codes as $code) {
            \App\Models\AccessCode::firstOrCreate(['code' => $code]);
        }
    }
}
