<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin Users
        User::firstOrCreate(
            ['email' => 'petar@transio.com'],
            ['name' => 'Petar', 'password' => 'password', 'role' => 'admin']
        );
        User::firstOrCreate(
            ['email' => 'admin@transio.com'],
            ['name' => 'Admin', 'password' => 'password', 'role' => 'admin']
        );
        User::firstOrCreate(
            ['email' => 'djole@transio.com'],
            ['name' => 'Djole', 'password' => 'password', 'role' => 'admin']
        );

        // Supplier Users
        $categories = [
            'CPU', 'GPU', 'RAM', 'Motherboard', 'Storage', 'PowerSupply',
            'Case', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Webcam',
        ];

        foreach ($categories as $category) {
            User::firstOrCreate(
                ['email' => strtolower($category) . '@supplier.com'],
                ['name' => $category . ' Supplier', 'password' => 'password', 'role' => 'supplier']
            );
        }

        // Importer Users
        $importers = [
            ['name' => 'Nvidia', 'email' => 'nvidia@importer.com'],
            ['name' => 'AMD', 'email' => 'amd@importer.com'],
            ['name' => 'Philips', 'email' => 'philips@importer.com'],
            ['name' => 'Intel', 'email' => 'intel@importer.com'],
            ['name' => 'Samsung', 'email' => 'samsung@importer.com'],
        ];

        foreach ($importers as $importer) {
            User::firstOrCreate(
                ['email' => $importer['email']],
                ['name' => $importer['name'], 'password' => 'password', 'role' => 'importer']
            );
        }
    }
}
