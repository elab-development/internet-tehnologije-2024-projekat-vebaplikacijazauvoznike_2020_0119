<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUsers = User::where('role', 'admin')->get();

        foreach ($adminUsers as $user) {
            Admin::firstOrCreate(
                ['user_id' => $user->id],
                ['name' => $user->name]
            );
        }
    }
}
