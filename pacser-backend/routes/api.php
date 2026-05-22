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
    Route::get('/quiz-sets/{id}/questions', [\App\Http\Controllers\QuizController::class, 'getQuestions']);
    Route::post('/quiz/submit', [\App\Http\Controllers\QuizController::class, 'submitQuiz']);
});