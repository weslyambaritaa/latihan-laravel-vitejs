<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['handle.inertia'])->group(function () {
    // ... (rute auth tidak berubah) ...
    Route::group(['prefix' => 'auth'], function () {
        Route::get('/login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('/login', [AuthController::class, 'postLogin'])->name('auth.login');

        Route::get('/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('/register', [AuthController::class, 'postRegister'])->name('auth.register');

        Route::get('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    });

    Route::group(['middleware' => 'check.auth'], function () {
        Route::get('/', [HomeController::class, 'home'])->name('home');

        Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
        
        // 1. TAMBAHKAN RUTE INI
        // Kita gunakan POST /{id} untuk update.
        Route::post('/todos/{todo}', [TodoController::class, 'update'])->name('todos.update');
    });
});