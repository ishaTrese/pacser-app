<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeeklyLeagueReward extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'rank_id',
        'week_start_date',
        'placement',
        'reward_tier',
        'badge_awarded',
        'points_awarded',
        'inventory_rewards',
    ];

    protected $casts = [
        'week_start_date' => 'datetime',
        'inventory_rewards' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
