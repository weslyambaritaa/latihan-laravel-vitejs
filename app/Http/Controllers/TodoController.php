<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage; // 1. Tambahkan ini

class TodoController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 2. Update validasi
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'required|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // maks 2MB
        ]);

        $coverPath = null;
        // 3. Logika untuk upload file
        if ($request->hasFile('cover')) {
            // Simpan gambar di 'storage/app/public/todos'
            $path = $request->file('cover')->store('public/todos');
            
            // Hapus 'public/' dari path agar bisa disimpan di DB
            $coverPath = str_replace('public/', '', $path);
        }

        // 4. Buat todo baru dengan data yang lengkap
        $request->user()->todos()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'is_finished' => $validated['is_finished'],
            'cover' => $coverPath,
        ]);

        // Redirect kembali ke halaman home
        return Redirect::route('home');
    }
}