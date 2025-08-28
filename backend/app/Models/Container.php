<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Container extends Model
{
    use HasFactory;

    protected $fillable = [
        'importer_id',
        'supplier_id',
        'total_cost',
        'max_volume',
        'total_volume',
        'max_price', // Added max_price
        'status',
    ];

    public function importer()
    {
        return $this->belongsTo(Importer::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function itemLogs()
    {
        return $this->hasMany(ItemLog::class);
    }
}