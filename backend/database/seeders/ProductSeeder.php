<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Supplier;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Definišemo strukturu: kategorija => niz slika za tu kategoriju
        $categoryImages = [
            'cpu' => [
                '/storage/products/cpu/01.webp', '/storage/products/cpu/02.webp', '/storage/products/cpu/03.webp', '/storage/products/cpu/04.webp', '/storage/products/cpu/05.webp',
                '/storage/products/cpu/06.webp', '/storage/products/cpu/07.webp', '/storage/products/cpu/08.webp', '/storage/products/cpu/09.webp', '/storage/products/cpu/10.webp',
            ],
            'gpu' => [
                '/storage/products/gpu/01.webp', '/storage/products/gpu/02.webp', '/storage/products/gpu/03.webp', '/storage/products/gpu/04.webp', '/storage/products/gpu/05.webp',
                '/storage/products/gpu/06.webp', '/storage/products/gpu/07.webp', '/storage/products/gpu/08.webp', '/storage/products/gpu/09.webp', '/storage/products/gpu/10.webp',
            ],
            'ram' => [
                '/storage/products/ram/01.webp', '/storage/products/ram/02.webp', '/storage/products/ram/03.webp', '/storage/products/ram/04.webp', '/storage/products/ram/05.webp',
                '/storage/products/ram/06.webp', '/storage/products/ram/07.webp', '/storage/products/ram/08.webp', '/storage/products/ram/09.webp', '/storage/products/ram/10.webp',
            ],
            'motherboard' => [
                '/storage/products/motherboard/01.webp', '/storage/products/motherboard/02.webp', '/storage/products/motherboard/03.webp', '/storage/products/motherboard/04.webp', '/storage/products/motherboard/05.webp',
                '/storage/products/motherboard/06.webp', '/storage/products/motherboard/07.webp', '/storage/products/motherboard/08.webp', '/storage/products/motherboard/09.webp', '/storage/products/motherboard/10.webp',
            ],
            'psu' => [
                '/storage/products/psu/01.webp', '/storage/products/psu/02.webp', '/storage/products/psu/03.webp', '/storage/products/psu/04.webp', '/storage/products/psu/05.webp',
                '/storage/products/psu/06.webp', '/storage/products/psu/07.webp', '/storage/products/psu/08.webp', '/storage/products/psu/09.webp', '/storage/products/psu/10.webp',
            ],
            'case' => [
                '/storage/products/case/01.webp', '/storage/products/case/02.webp', '/storage/products/case/03.webp', '/storage/products/case/04.webp', '/storage/products/case/05.webp',
                '/storage/products/case/06.webp', '/storage/products/case/07.webp', '/storage/products/case/08.webp', '/storage/products/case/09.webp', '/storage/products/case/10.webp',
            ],
            'monitor' => [
                '/storage/products/monitor/01.webp', '/storage/products/monitor/02.webp', '/storage/products/monitor/03.webp', '/storage/products/monitor/04.webp', '/storage/products/monitor/05.webp',
                '/storage/products/monitor/06.webp', '/storage/products/monitor/07.webp', '/storage/products/monitor/08.webp', '/storage/products/monitor/09.webp', '/storage/products/monitor/10.webp',
            ],
            'keyboard' => [
                '/storage/products/keyboard/01.webp', '/storage/products/keyboard/02.webp', '/storage/products/keyboard/03.webp', '/storage/products/keyboard/04.webp', '/storage/products/keyboard/05.webp',
                '/storage/products/keyboard/06.webp', '/storage/products/keyboard/07.webp', '/storage/products/keyboard/08.webp', '/storage/products/keyboard/09.webp', '/storage/products/keyboard/10.webp',
            ],
            'mouse' => [
                '/storage/products/mouse/01.webp', '/storage/products/mouse/02.webp', '/storage/products/mouse/03.webp', '/storage/products/mouse/04.webp', '/storage/products/mouse/05.webp',
                '/storage/products/mouse/06.webp', '/storage/products/mouse/07.webp', '/storage/products/mouse/08.webp', '/storage/products/mouse/09.webp', '/storage/products/mouse/10.webp',
            ],
            'headphones' => [
                '/storage/products/headphones/01.webp', '/storage/products/headphones/02.webp', '/storage/products/headphones/03.webp', '/storage/products/headphones/04.webp', '/storage/products/headphones/05.webp',
                '/storage/products/headphones/06.webp', '/storage/products/headphones/07.webp', '/storage/products/headphones/08.webp', '/storage/products/headphones/09.webp', '/storage/products/headphones/10.webp',
            ],
            'webcam' => [
                '/storage/products/webcam/01.webp', '/storage/products/webcam/02.webp', '/storage/products/webcam/03.webp', '/storage/products/webcam/04.webp', '/storage/products/webcam/05.webp',
                '/storage/products/webcam/06.webp', '/storage/products/webcam/07.webp', '/storage/products/webcam/08.webp', '/storage/products/webcam/09.webp', '/storage/products/webcam/10.webp',
            ],
            'microphone' => [
                '/storage/products/microphone/01.webp', '/storage/products/microphone/02.webp', '/storage/products/microphone/03.webp', '/storage/products/microphone/04.webp', '/storage/products/microphone/05.webp',
                '/storage/products/microphone/06.webp', '/storage/products/microphone/07.webp', '/storage/products/microphone/08.webp', '/storage/products/microphone/09.webp', '/storage/products/microphone/10.webp',
            ],
        ];

        $categories = array_keys($categoryImages);
        $suppliers = Supplier::all();

        // 2. Petlja koja kreira 120 proizvoda
        for ($i = 0; $i < 120; $i++) {
            // 3. Za svaki proizvod, prvo nasumično odaberemo kategoriju
            $randomCategory = $categories[array_rand($categories)];

            // 4. Zatim, iz te kategorije, nasumično odaberemo jednu sliku
            $randomImage = $categoryImages[$randomCategory][array_rand($categoryImages[$randomCategory])];

            // 5. Kreiramo proizvod pomoću fabrike, ali PREGAZIMO (override) podatke
            Product::factory()->create([
                'category' => $randomCategory,
                'image_url' => $randomImage,
                'supplier_id' => $suppliers->random()->id,
            ]);
        }
    }
}