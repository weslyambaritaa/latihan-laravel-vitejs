<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
// Import Request
use Illuminate\Http\Request;

class HomeController extends Controller
{
    // Terima instance Request
    public function home(Request $request) 
    {
        $auth = Auth::user();

        // Ambil parameter dari request
        $search = $request->input('search');
        $filter = $request->input('filter', 'all'); // Default 'all'

        // 1. Ambil todos milik user, urutkan dari yang terbaru
        $todosQuery = $auth->todos()->latest(); //

        // Logika Search: Cari di kolom title atau description
        if ($search) {
            $todosQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Logika Filter: Filter berdasarkan status
        if ($filter === 'finished') {
            $todosQuery->where('is_finished', true);
        } elseif ($filter === 'unfinished') {
            $todosQuery->where('is_finished', false);
        }
        // Jika 'all', tidak perlu menambah kondisi filter

        $todos = $todosQuery->get();

        $data = [
            'auth' => $auth,
            'todos' => $todos, // 2. Kirim data todos yang sudah difilter/dicari ke frontend
            // Kirim kembali state search dan filter ke frontend
            'filters' => [
                'search' => $search,
                'filter' => $filter,
            ]
        ];

        return Inertia::render('App/HomePage', $data);
    }
}