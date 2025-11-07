<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage; // 1. Tambahkan ini

class Todo extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'is_finished',
        'cover',
    ];

    /**
     * Get the user that owns the todo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // 2. Tambahkan accessor ini untuk URL gambar
    /**
     * Get the URL for the todo's cover image.
     *
     * @return string|null
     */
    public function getCoverUrlAttribute(): ?string
    {
        if ($this->cover) {
            // Ini akan menghasilkan URL publik seperti 'http://localhost/storage/todos/namafile.jpg'
            return Storage::url($this->cover);
        }
        return null;
    }
}