<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Polja koja je dozvoljeno masovno popunjavati.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * Polja koja treba sakriti u JSON-u.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Cast-ovi.
     * Napomena: 'password' => 'hashed' znači da NE treba ručno Hash::make() pri kreiranju.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relacije 1:1 prema Admin / Importer / Supplier
    public function admin()
    {
        return $this->hasOne(Admin::class);
    }

    public function importer()
    {
        return $this->hasOne(Importer::class);
    }

    public function supplier()
    {
        return $this->hasOne(Supplier::class);
    }
}