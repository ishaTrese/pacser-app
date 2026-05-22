<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizLog extends Model
{
    protected $fillable = ['user_id', 'quiz_set_id', 'score', 'total', 'percentage'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quizSet()
    {
        return $this->belongsTo(QuizSet::class);
    }
}
