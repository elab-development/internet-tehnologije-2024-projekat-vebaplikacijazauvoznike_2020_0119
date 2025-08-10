<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'name'        => $this->faker->words(2, true),
            'price'       => $this->faker->randomFloat(2, 1, 200),
            'volume'      => $this->faker->randomFloat(2, 0.1, 5),
            'category'    => $this->faker->randomElement(['gadgets','food','tools','textiles']),
            'image'       => null,
            'description' => $this->faker->sentence(),
        ];
    }
}