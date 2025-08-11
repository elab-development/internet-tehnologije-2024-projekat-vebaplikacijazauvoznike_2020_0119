<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Importer;
use App\Models\Product;
use App\Models\Container;
use App\Models\ItemLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Admin (po želji)
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        // 2) 10 SUPPLIERS (svakom napravimo i user-a role=supplier)
        $suppliers = collect();
        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name'     => "SupplierUser {$i}",
                'email'    => "supplier{$i}@example.com",
                'password' => Hash::make('password'),
                'role'     => 'supplier',
            ]);

            $supplier = Supplier::factory()->create([
                'user_id' => $user->id,
            ]);

            $suppliers->push($supplier);

            // 5–15 proizvoda po dobavljaču
            $count = random_int(5, 15);
            Product::factory($count)->create([
                'supplier_id' => $supplier->id,
            ]);
        }

        // 3) 30 IMPORTERS (svakom napravimo i user-a role=importer)
        $importers = collect();
        for ($i = 1; $i <= 30; $i++) {
            $user = User::create([
                'name'     => "ImporterUser {$i}",
                'email'    => "importer{$i}@example.com",
                'password' => Hash::make('password'),
                'role'     => 'importer',
            ]);

            $importer = Importer::factory()->create([
                'user_id' => $user->id,
            ]);

            $importers->push($importer);
        }

        // 4) KONTEJNERI (nasumično uparimo importera i supplier-a)
        //    Pravilo: ItemLog proizvod mora pripadati ISTOM supplieru kao kontejner.
        //    Ako tvoja tabela containers ima dodatna obavezna polja – dodaj ih ovde!
        $containers = collect();
        $containersToMake = 25;

        for ($i = 1; $i <= $containersToMake; $i++) {
            $supplier = $suppliers->random();
            $importer = $importers->random();

            $container = Container::create([
                'supplier_id' => $supplier->id,
                'importer_id' => $importer->id,
                // ako imaš status/reference datume i slično, možeš ovde:
                // 'status' => fake()->randomElement(['draft','in_transit','arrived']),
                // 'reference' => 'CNT-' . str_pad((string)$i, 5, '0', STR_PAD_LEFT),
            ]);

            $containers->push($container);

            // 5) ITEM LOGS (1–8 stavki po kontejneru), proizvodi tog supplier-a
            $supplierProducts = Product::where('supplier_id', $supplier->id)->get();
            $itemsCount = random_int(1, 8);

            for ($j = 0; $j < $itemsCount; $j++) {
                if ($supplierProducts->isEmpty()) break;

                $product = $supplierProducts->random();

                ItemLog::create([
                    'container_id' => $container->id,
                    'product_id'   => $product->id,
                    'quantity'     => random_int(5, 200),
                    'action'       => 'add',   // ako ti je obavezno polje
                    // dodaj ostala polja ako tvoja tabela to traži
                ]);
            }
        }
    }
}