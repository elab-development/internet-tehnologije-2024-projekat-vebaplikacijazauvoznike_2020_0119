<?php

namespace Database\Factories;

use App\Models\Importer;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImporterFactory extends Factory
{
    protected $model = Importer::class;

    public function definition(): array
    {
        $companies = [
            'Atlantic Import', 'Sunrise Traders', 'Global Market Line', 'Delta Import Group',
            'Urban Foods Import', 'FarEast Connect', 'Mediterra Imports', 'Nordic Link',
            'PrimeGate Logistics', 'Orion Import Co',
        ];

        $countries = ['Serbia','Croatia','Bosnia and Herzegovina','North Macedonia','Montenegro','Slovenia','Hungary','Romania','Bulgaria','Greece'];

        return [
            // user_id dodeljujemo u seederu
            'company_name' => $this->faker->unique()->randomElement($companies),
            'country'      => $this->faker->randomElement($countries),
        ];
    }
}