<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$codes = ['PACSER-PREMIUM', 'CHQ-ACCESS-2026', 'INSIGNIA-2026', 'PACSER-TEST01', 'PACSER-TEST02'];
foreach($codes as $code) {
    if (!App\Models\AccessCode::where('code', $code)->exists()) {
        App\Models\AccessCode::create(['code' => $code, 'is_used' => false]);
        echo "Created code: $code\n";
    } else {
        echo "Code exists: $code\n";
    }
}
echo "Done\n";
