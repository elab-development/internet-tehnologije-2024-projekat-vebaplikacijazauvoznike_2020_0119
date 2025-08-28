<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Importer;
use App\Models\User;

class ImporterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $importerUsers = User::where('role', 'importer')->get();

        foreach ($importerUsers as $user) {
            Importer::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $user->name,
                    'country' => 'Serbia',
                ]
            );
        }
    }
}
