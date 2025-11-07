<?php

namespace App\Http\Controllers;

use App\Models\Todo; // Pastikan ini di-import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;

class TodoController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'required|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // maks 2MB
        ]);

        $coverPath = null;
        // Logika untuk upload file
        if ($request->hasFile('cover')) {
            // Simpan gambar di 'storage/app/public/todos'
            $path = $request->file('cover')->store('public/todos');
            
            // Hapus 'public/' dari path agar bisa disimpan di DB
            $coverPath = str_replace('public/', '', $path);
        }

        // Buat todo baru dengan data yang lengkap
        $request->user()->todos()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'is_finished' => $validated['is_finished'],
            'cover' => $coverPath,
        ]);

        // Redirect kembali ke halaman home
        return Redirect::route('home');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Todo $todo)
    {
        // Otorisasi
        if ($request->user()->id !== $todo->user_id) {
            abort(403, 'Akses tidak diizinkan');
        }

        // Validasi baru
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'required|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'remove_cover' => 'nullable|boolean',
        ]);

        // Siapkan data untuk di-update (selain cover)
        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'is_finished' => $validated['is_finished'],
        ];

        // Mulai dengan path yang ada
        $coverPath = $todo->cover; 

        if ($request->hasFile('cover')) {
            // A. Jika ada file BARU di-upload
            // Hapus file lama (jika ada)
            if ($todo->cover) {
                // --- INI PERBAIKANNYA ---
                Storage::delete('public/' . $todo->cover); 
            }
            
            // Simpan file baru
            $path = $request->file('cover')->store('public/todos');
            $coverPath = str_replace('public/', '', $path);

        } elseif ($request->boolean('remove_cover')) {
            // B. Jika user mencentang "Hapus gambar"
            // Hapus file lama (jika ada)
            if ($todo->cover) {
                Storage::delete('public/' . $todo->cover);
            }
            $coverPath = null; // Set path ke null
        }

        // Tambahkan path cover ke data update
        $updateData['cover'] = $coverPath;

        // Update data
        $todo->update($updateData);

        // Redirect kembali
        return Redirect::route('home');
    }
}