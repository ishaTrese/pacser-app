<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RankHistory extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'old_rank_id', 'new_rank_id', 'weekly_xp', 'status', 'week_start_date'];
}
