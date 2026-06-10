<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'quiz_set_id',
        'active_attempt_key',
        'status',
        'energy_charged',
        'started_at',
        'submitted_at',
    ];

    protected $casts = [
        'energy_charged' => 'boolean',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quizSet()
    {
        return $this->belongsTo(QuizSet::class);
    }
}
