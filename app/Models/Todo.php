<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage; // 1. Pastikan ini ada

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

    // 2. PASTIKAN FUNGSI INI ADA
    /**
     * Get the URL for the todo's cover image.
     *
     * @return string|null
     */
    public function getCoverUrlAttribute(): ?string
    {
        if ($this->cover) {
            // Fungsi Storage::url() akan otomatis menggunakan APP_URL dari .env
            return Storage::url($this->cover);
        }
        return null;
    }
}