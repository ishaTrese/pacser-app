<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MockExamResult extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'total_score', 'total_items', 'subject_scores'];
    protected $casts = ['subject_scores' => 'array'];
}
