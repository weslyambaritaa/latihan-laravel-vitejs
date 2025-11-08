<?php

namespace App\Http\Controllers; // <-- KESALAHAN SUDAH DIPERBAIKI DI SINI

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia; // Pastikan ini di-import

class TodoController extends Controller
{
    /**
     * Store a newly created resource in storage.
     * (Method 'store' tidak berubah)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'required|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            // PASTIKAN ini ('todos', 'public') dan TIDAK ADA str_replace
            $coverPath = $request->file('cover')->store('todos', 'public');
        }

        $request->user()->todos()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'is_finished' => $validated['is_finished'],
            'cover' => $coverPath,
        ]);

        return Redirect::route('home');
    }

    /**
     * METHOD BARU
     * Display the specified resource.
     */
    public function show(Request $request, Todo $todo)
    {
        // Otorisasi
        if ($request->user()->id !== $todo->user_id) {
            abort(403, 'Akses tidak diizinkan');
        }

        // Render halaman React baru dan kirim data 'todo'
        return Inertia::render('App/Todos/Show', [
            'todo' => $todo
        ]);
    }

    /**
     * METHOD UPDATE (DISEDERHANAKAN)
     * Update the specified resource in storage.
     */
    public function update(Request $request, Todo $todo)
    {
        // Otorisasi
        if ($request->user()->id !== $todo->user_id) {
            abort(403, 'Akses tidak diizinkan');
        }

        // Validasi HANYA untuk data teks
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'required|boolean',
        ]);
        
        // Update data
        $todo->update($validated);

        // Redirect kembali ke halaman sebelumnya (bisa home atau detail)
        return Redirect::back();
    }

    /**
     * METHOD BARU
     * Update the cover image for the specified resource.
     */
    public function updateCover(Request $request, Todo $todo)
    {
        // Otorisasi
        if ($request->user()->id !== $todo->user_id) {
            abort(403, 'Akses tidak diizinkan');
        }

        // Validasi hanya untuk gambar
        $validated = $request->validate([
            'cover' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'remove_cover' => 'nullable|boolean',
        ]);

        $coverPath = $todo->cover; // Biarkan ini

        if ($request->hasFile('cover')) {
            if ($todo->cover) {
                // PASTIKAN ada disk('public')
                Storage::disk('public')->delete($todo->cover);
            }
            // PASTIKAN ini ('todos', 'public') dan TIDAK ADA str_replace
            $coverPath = $request->file('cover')->store('todos', 'public');

        } elseif ($request->boolean('remove_cover')) {
            if ($todo->cover) {
                // PASTIKAN ada disk('public')
                Storage::disk('public')->delete($todo->cover);
            }
            $coverPath = null;
        }

        // Update database
        $todo->update(['cover' => $coverPath]);

        // Redirect kembali ke halaman detail
        return Redirect::route('todos.show', $todo->id);
    }


    /**
     * Remove the specified resource from storage.
     * (Method 'destroy' tidak berubah)
     */
    public function destroy(Request $request, Todo $todo)
    {
        // Otorisasi
        if ($request->user()->id !== $todo->user_id) {
            abort(403, 'Akses tidak diizinkan');
        }

        // Hapus gambar dari storage (jika ada)
        if ($todo->cover) {
            Storage::delete('public/' . $todo->cover);
        }

        // Hapus data dari database
        $todo->delete();

        // Redirect kembali ke home
        return Redirect::route('home');
    }
}