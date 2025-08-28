<?php

namespace Database\Factories;

use App\Models\Container;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'container_id' => Container::factory(),
            'product_id'   => Product::factory(),
            'quantity'     => $this->faker->numberBetween(1, 50),
            'logged_at'    => $this->faker->dateTimeBetween('-10 days', 'now'),
        ];
    }
}