<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes — require a valid Sanctum token
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',   function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Quiz Routes
    Route::get('/subjects/{slug}/quiz-sets', [\App\Http\Controllers\SubjectController::class, 'getQuizSets']);
    Route::post('/quiz-sets/{id}/start', [\App\Http\Controllers\QuizController::class, 'start']);
    Route::get('/quiz-sets/{id}/questions', [\App\Http\Controllers\QuizController::class, 'getQuestions']);
    Route::post('/quiz/submit', [\App\Http\Controllers\QuizController::class, 'submitQuiz']);

    // Pretest
    Route::get('/pretest/questions', [\App\Http\Controllers\PretestController::class, 'getQuestions']);
    Route::post('/pretest/submit', [\App\Http\Controllers\PretestController::class, 'submit']);

    // Mock Exam
    Route::get('/mock-exam/questions', [\App\Http\Controllers\MockExamController::class, 'getQuestions']);
    Route::get('/mock-exam/history', [\App\Http\Controllers\MockExamController::class, 'history']);
    Route::post('/mock-exam/submit', [\App\Http\Controllers\MockExamController::class, 'submit']);

    // Dashboard Stats
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

    // Leaderboard
    Route::get('/leaderboard', [\App\Http\Controllers\LeaderboardController::class, 'index']);

    // Shop
    Route::post('/shop/purchase', [\App\Http\Controllers\ShopController::class, 'purchase']);
    Route::post('/shop/activate', [\App\Http\Controllers\ShopController::class, 'activate']);

    // Admin God Mode & Content Management
    Route::post('/admin/god-mode', [\App\Http\Controllers\AdminController::class, 'godModeUpdate']);
    Route::get('/admin/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
    Route::get('/admin/quiz-sets', [\App\Http\Controllers\AdminController::class, 'getQuizSets']);
    Route::get('/admin/questions', [\App\Http\Controllers\AdminController::class, 'getQuestions']);
    Route::get('/admin/questions/{id}', [\App\Http\Controllers\AdminController::class, 'getQuestion']);
    Route::post('/admin/questions', [\App\Http\Controllers\AdminController::class, 'createQuestion']);
    Route::put('/admin/questions/{id}', [\App\Http\Controllers\AdminController::class, 'updateQuestion']);
    Route::delete('/admin/questions/{id}', [\App\Http\Controllers\AdminController::class, 'deleteQuestion']);

    // Profile & Settings
    Route::get('/profile/stats', [\App\Http\Controllers\UserController::class, 'profileStats']);
    Route::post('/profile/update', [\App\Http\Controllers\UserController::class, 'updateAccount']);
    Route::post('/profile/redeem', [\App\Http\Controllers\UserController::class, 'redeemCode']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);

    // Daily Missions
    Route::get('/missions', [\App\Http\Controllers\MissionController::class, 'index']);
    Route::post('/missions/{id}/claim', [\App\Http\Controllers\MissionController::class, 'claim']);
});
