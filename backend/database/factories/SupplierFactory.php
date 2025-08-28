<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        $companies = [
            'Balkan Foods DOO', 'Adriatic Trade', 'EuroDelights', 'Danube Imports',
            'Pannonian Supply', 'Dinaric Goods', 'TerraNova Commerce', 'BlueRiver Global',
            'Silver Line Exports', 'GreenLeaf Distribution',
        ];

        $countries = ['Serbia','Croatia','Bosnia and Herzegovina','North Macedonia','Montenegro','Slovenia','Hungary','Romania','Bulgaria','Greece'];

        return [
            // user_id dodeljujemo u seederu
            'company_name' => $this->faker->unique()->randomElement($companies),
            'country'      => $this->faker->randomElement($countries),
        ];
    }
}