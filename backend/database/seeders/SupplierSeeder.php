<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\User;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $supplierUsers = User::where('role', 'supplier')->get();

        foreach ($supplierUsers as $user) {
            Supplier::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $user->name,
                    'country' => 'Serbia',
                ]
            );
        }
    }
}
