<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;

class TodoController extends Controller
{
    // ... (method store tidak berubah) ...
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
            $path = $request->file('cover')->store('public/todos');
            $coverPath = str_replace('public/', '', $path);
        }

        $request->user()->todos()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'is_finished' => $validated['is_finished'],
            'cover' => $coverPath,
        ]);

        return Redirect::route('home');
    }

    // ... (method update tidak berubah) ...
    public function update(Request $request, Todo $todo)
    {
        if ($request->user()->id !== $todo->user_id) {
            abort(403, 'Akses tidak diizinkan');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'required|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'remove_cover' => 'nullable|boolean',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'is_finished' => $validated['is_finished'],
        ];

        $coverPath = $todo->cover; 

        if ($request->hasFile('cover')) {
            if ($todo->cover) {
                Storage::delete('public/' . $todo->cover); 
            }
            
            $path = $request->file('cover')->store('public/todos');
            $coverPath = str_replace('public/', '', $path);

        } elseif ($request->boolean('remove_cover')) {
            if ($todo->cover) {
                Storage::delete('public/' . $todo->cover);
            }
            $coverPath = null;
        }

        $updateData['cover'] = $coverPath;
        $todo->update($updateData);

        return Redirect::route('home');
    }

    // 2. TAMBAHKAN METHOD BARU INI
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Todo $todo)
    {
        // 3. Otorisasi: Pastikan user yang login adalah pemilik todo
        if ($request->user()->id !== $todo->user_id) {
            abort(403, 'Akses tidak diizinkan');
        }

        // 4. Hapus gambar dari storage (jika ada)
        if ($todo->cover) {
            Storage::delete('public/' . $todo->cover);
        }

        // 5. Hapus data dari database
        $todo->delete();

        // 6. Redirect kembali
        return Redirect::route('home');
    }
}