<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AccessCode extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'is_used', 'used_by', 'used_at', 'disabled_at'];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'disabled_at' => 'datetime',
    ];

    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by');
    }
}
