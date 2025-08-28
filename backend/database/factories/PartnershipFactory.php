<?php

namespace Database\Factories;

use App\Models\Importer;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartnershipFactory extends Factory
{
    public function definition(): array
    {
        return [
            'importer_id' => Importer::factory(),
            'supplier_id' => Supplier::factory(),
        ];
    }
}