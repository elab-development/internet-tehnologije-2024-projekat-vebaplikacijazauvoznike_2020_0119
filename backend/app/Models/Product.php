<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    // Dozvoljena polja za masovno popunjavanje
    protected $fillable = [
        'supplier_id',
        'name',
        'description',
        'category',
        'price',
        'volume',
        'image_url'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function itemLogs()
    {
        return $this->hasMany(ItemLog::class);
    }
}