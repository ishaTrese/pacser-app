<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    use HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'xp',
        'points',
        'energy',
        'max_energy',
        'streak',
        'last_login_date',
        'last_study_date',
        'role',
        'double_xp_until',
        'inventory_double_xp',
        'inventory_streak_freezes',
        'inventory_energy_refills',
        'inventory_energy_plus_one',
        'streak_freeze_active',
        'is_premium',
        'mock_exam_completed',
        'rank_id',
        'weekly_xp',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_date' => 'date',
            'last_study_date' => 'date',
        ];
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function quizLogs()
    {
        return $this->hasMany(QuizLog::class);
    }
}
