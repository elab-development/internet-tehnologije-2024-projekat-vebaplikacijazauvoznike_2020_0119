<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Dozvoljena polja za masovno popunjavanje
    protected $fillable = [
        'supplier_id',
        'name',
        'description',
        'category',
        'price',
        'volume',
        'image'
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