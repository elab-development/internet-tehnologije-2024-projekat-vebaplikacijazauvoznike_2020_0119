<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class ItemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'container_id',
        'product_id',
        'quantity',
        'logged_at',
    ];

    public function container()
    {
        return $this->belongsTo(Container::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}