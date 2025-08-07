<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Container extends Model
{
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