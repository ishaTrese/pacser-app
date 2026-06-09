<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMission extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'mission_type', 'progress', 'target', 'points_reward', 'is_completed', 'is_claimed', 'date'];
}
