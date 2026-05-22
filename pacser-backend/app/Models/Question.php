<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = ['quiz_set_id', 'question_text', 'explanation'];

    public function quizSet()
    {
        return $this->belongsTo(QuizSet::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
