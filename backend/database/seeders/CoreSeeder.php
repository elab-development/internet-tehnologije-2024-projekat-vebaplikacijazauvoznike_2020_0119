<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Admin;
use App\Models\Importer;
use App\Models\Supplier;
use App\Models\Partnership;
use App\Models\Product;
use App\Models\Container;
use App\Models\ItemLog;

class CoreSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // --- USERS ---
            $adminUser = User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Head Admin',
                    'password' => Hash::make('pass12345'),
                    'role' => 'admin',
                ]
            );

            $impUser = User::firstOrCreate(
                ['email' => 'imp1@example.com'],
                [
                    'name' => 'Importer One',
                    'password' => Hash::make('pass12345'),
                    'role' => 'importer',
                ]
            );

            $supUser = User::firstOrCreate(
                ['email' => 'sup1@example.com'],
                [
                    'name' => 'Supplier One',
                    'password' => Hash::make('pass12345'),
                    'role' => 'supplier',
                ]
            );

            // --- ROLE PROFILES ---
            Admin::firstOrCreate(
                ['user_id' => $adminUser->id],
                ['name' => 'Head Admin']
            );

            $imp = Importer::firstOrCreate(
                ['user_id' => $impUser->id],
                ['company_name' => 'Importer Co', 'country' => 'Serbia']
            );

            $sup = Supplier::firstOrCreate(
                ['user_id' => $supUser->id],
                ['company_name' => 'Supplier Co', 'country' => 'Serbia']
            );

            // --- PARTNERSHIP ---
            Partnership::firstOrCreate([
                'importer_id' => $imp->id,
                'supplier_id' => $sup->id,
            ]);

            // --- PRODUCTS (supplier) ---
            $p1 = Product::firstOrCreate(
                ['supplier_id' => $sup->id, 'name' => 'Widget'],
                ['price' => 12.5, 'volume' => 3.2, 'category' => 'gadgets', 'image' => null, 'description' => 'Test artikal']
            );
            $p2 = Product::firstOrCreate(
                ['supplier_id' => $sup->id, 'name' => 'Gizmo'],
                ['price' => 7.9, 'volume' => 1.8, 'category' => 'gadgets', 'image' => null, 'description' => 'Drugi artikal']
            );
            $p3 = Product::firstOrCreate(
                ['supplier_id' => $sup->id, 'name' => 'Doohickey'],
                ['price' => 19.99, 'volume' => 4.5, 'category' => 'tools', 'image' => null, 'description' => 'Treći artikal']
            );

            // --- CONTAINER (imp + sup) ---
            $cont = Container::firstOrCreate(
                ['importer_id' => $imp->id, 'supplier_id' => $sup->id, 'status' => 'pending'],
                ['total_cost' => 0, 'max_volume' => 1000]
            );

            // --- ITEM LOGS ---
            ItemLog::firstOrCreate(
                ['container_id' => $cont->id, 'product_id' => $p1->id, 'quantity' => 10, 'logged_at' => now()]
            );
            ItemLog::firstOrCreate(
                ['container_id' => $cont->id, 'product_id' => $p2->id, 'quantity' => 5, 'logged_at' => now()]
            );
            ItemLog::firstOrCreate(
                ['container_id' => $cont->id, 'product_id' => $p3->id, 'quantity' => 2, 'logged_at' => now()]
            );

            // --- RECALC total_cost (sum qty*price) ---
            $agg = ItemLog::where('container_id', $cont->id)
                ->join('products', 'item_logs.product_id', '=', 'products.id')
                ->selectRaw('sum(item_logs.quantity * products.price) as c')
                ->first();

            $cont->update(['total_cost' => $agg->c ?? 0]);
        });
    }
}