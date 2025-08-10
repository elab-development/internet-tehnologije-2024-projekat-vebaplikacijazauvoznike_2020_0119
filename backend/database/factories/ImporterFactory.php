<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImporterFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'      => User::factory()->importer(),
            'company_name' => $this->faker->company(),
            'country'      => $this->faker->country(),
        ];
    }
}