<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        
        $categories = [
            'piće' => [
                'Mineralna voda 0.5L', 'Sok od narandže 1L', 'Ledeni čaj breskva 1.5L',
                'Gazirana limunada 0.33L', 'Kafa mlevena 200g', 'Crni čaj 20 kesica',
            ],
            'prehrana' => [
                'Maslinovo ulje ekstra devičansko 750ml', 'Riža basmati 1kg',
                'Pasta penne 500g', 'Tunjevina u maslinovom ulju 170g',
                'Kikiriki puter crunchy 350g', 'Kukuruz šećerac 340g',
            ],
            'slatkiši' => [
                'Čokolada sa lešnikom 100g', 'Keks integralni 250g',
                'Bar sa žitaricama 40g', 'Lizin bombone mentol 75g',
            ],
            'domaćinstvo' => [
                'Deterdžent za sudove 1L', 'Sredstvo za čišćenje stakla 750ml',
                'Sunđeri za sudove (5/1)', 'Papirne ubruse 2-rola',
            ],
            'lična nega' => [
                'Gel za tuširanje 400ml', 'Šampon za kosu 500ml',
                'Pasta za zube 125ml', 'Dezodorans roll-on 50ml',
            ],
        ];

        // Izaberi nasumičnu kategoriju i ime unutar nje
        $category = $this->faker->randomElement(array_keys($categories));
        $name     = $this->faker->randomElement($categories[$category]);

        return [
            // supplier_id se setuje u seederu
            'name'        => $name,
            'description' => $this->faker->sentence(),
            'category'    => $category,
            'price'       => $this->faker->randomFloat(2, 1, 120),   // 1.00 – 120.00
            'volume'      => $this->faker->randomFloat(2, 0.1, 10),  // npr. kg/L/kom
            'image'       => null,
        ];
    }
}