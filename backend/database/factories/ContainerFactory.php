<?php

namespace Database\Factories;

use App\Models\Container;
use App\Models\Importer;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Container> */
class ContainerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'importer_id' => Importer::factory(),
            'supplier_id' => Supplier::factory(),
            'total_cost'  => 0,
            'max_volume'  => $this->faker->randomFloat(2, 200, 5000),
            'status'      => $this->faker->randomElement(['pending','shipped','delivered']),
        ];
    }
}