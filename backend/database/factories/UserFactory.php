<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/** @extends Factory<\App\Models\User> */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'  => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('pass12345'),
            'role'  => $this->faker->randomElement(['admin','importer','supplier']),
        ];
    }

    public function admin(): static   { return $this->state(fn()=>['role'=>'admin']); }
    public function importer(): static{ return $this->state(fn()=>['role'=>'importer']); }
    public function supplier(): static{ return $this->state(fn()=>['role'=>'supplier']); }
}