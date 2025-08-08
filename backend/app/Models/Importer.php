<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Importer extends Model
{

    protected $fillable = ['user_id','company_name','country'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function containers()
    {
        return $this->hasMany(Container::class);
    }

    public function partnerships()
    {
        return $this->hasMany(Partnership::class);
    }
}