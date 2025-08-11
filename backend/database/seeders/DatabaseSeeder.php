<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Admin;
use App\Models\Importer;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Container;
use App\Models\ItemLog;
use App\Models\Partnership;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Admin (1 kom)
        $adminUser = User::create([
            'name' => 'Admin One',
            'email' => 'admin@example.com',
            'password' => Hash::make('pass12345'),
            'role' => 'admin',
        ]);
        Admin::create([
            'user_id' => $adminUser->id,
            'name'    => 'Super Admin',
        ]);

        // 2) Importeri (3 kom) + povezani users
        $importers = collect();
        foreach (range(1,3) as $i) {
            $u = User::create([
                'name' => "Importer $i",
                'email' => "imp{$i}@example.com",
                'password' => Hash::make('pass12345'),
                'role' => 'importer',
            ]);
            $imp = Importer::create([
                'user_id' => $u->id,
                'company_name' => "Importer Co $i",
                'country' => 'Serbia',
            ]);
            $importers->push($imp);
        }

        // 3) Supplier-i (3 kom) + povezani users
        $suppliers = collect();
        foreach (range(1,3) as $i) {
            $u = User::create([
                'name' => "Supplier $i",
                'email' => "sup{$i}@example.com",
                'password' => Hash::make('pass12345'),
                'role' => 'supplier',
            ]);
            $sup = Supplier::create([
                'user_id' => $u->id,
                'company_name' => "Supplier Co $i",
                'country' => 'Serbia',
            ]);
            $suppliers->push($sup);
        }

        // 4) Partnership-i (svaki importer u partnerstvu sa prvim supplier-om)
        $mainSupplier = $suppliers->first();
        foreach ($importers as $imp) {
            Partnership::firstOrCreate([
                'importer_id' => $imp->id,
                'supplier_id' => $mainSupplier->id,
            ]);
        }

        // 5) Proizvodi (po 5 za prvog supplier-a)
        $products = collect();
        foreach (range(1,5) as $i) {
            $p = Product::create([
                'supplier_id' => $mainSupplier->id,
                'name' => "Product $i",
                'price' => 10 + $i,     // 11..15
                'volume' => 1.5 + $i,   // 2.5..6.5
                'category' => 'general',
                'image' => null,
                'description' => 'Seeded product',
            ]);
            $products->push($p);
        }

        // 6) Container-i (po 2 za prvog importera sa prvim supplier-om)
        $mainImporter = $importers->first();
        $containers = collect();
        foreach (range(1,2) as $i) {
            $c = Container::create([
                'importer_id' => $mainImporter->id,
                'supplier_id' => $mainSupplier->id,
                'total_cost' => 0,
                'max_volume' => 1000,
                'status' => 'pending',
            ]);
            $containers->push($c);
        }

        // 7) ItemLog-ovi (svaki container dobije po 3 stavke)
        foreach ($containers as $c) {
            foreach ($products->take(3) as $p) {
                ItemLog::create([
                    'container_id' => $c->id,
                    'product_id' => $p->id,
                    'quantity' => rand(5, 15),
                    'logged_at' => now(),
                ]);
            }

            // Reizračunaj total_cost kontejnera
            $agg = ItemLog::where('container_id', $c->id)
                ->join('products', 'item_logs.product_id', '=', 'products.id')
                ->selectRaw('sum(item_logs.quantity*products.price) as total')
                ->first();
            $c->update(['total_cost' => $agg->total ?? 0]);
        }
    }
}