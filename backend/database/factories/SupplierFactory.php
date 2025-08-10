<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'      => User::factory()->supplier(),
            'company_name' => $this->faker->company(),
            'country'      => $this->faker->country(),
        ];
    }
}