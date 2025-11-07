<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function home()
    {
        $auth = Auth::user();

        // 1. Ambil todos milik user, urutkan dari yang terbaru
        $todos = $auth->todos()->latest()->get();

        $data = [
            'auth' => $auth,
            'todos' => $todos, // 2. Kirim data todos ke frontend
        ];

        return Inertia::render('App/HomePage', $data);
    }
}