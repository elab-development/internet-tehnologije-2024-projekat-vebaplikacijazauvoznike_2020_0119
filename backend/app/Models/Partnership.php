<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Partnership extends Model
{
    use HasFactory;

    protected $fillable = ['importer_id', 'supplier_id'];

    public function importer()
    {
        return $this->belongsTo(Importer::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}