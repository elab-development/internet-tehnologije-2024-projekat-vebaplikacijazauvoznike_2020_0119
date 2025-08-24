<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Container;
use Illuminate\Support\Facades\DB;

class RecalculateContainerVolumesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Container::with('itemLogs.product')->chunk(100, function ($containers) {
            foreach ($containers as $container) {
                $totalVolume = $container->itemLogs->sum(function ($itemLog) {
                    // Ensure product relationship is loaded and volume is not null
                    return $itemLog->quantity * ($itemLog->product->volume ?? 0);
                });
                $container->update(['total_volume' => $totalVolume]);
                $this->command->info("Container {$container->id}: Recalculated total_volume to {$totalVolume}");
            }
        });

        $this->command->info('All container volumes recalculated.');
    }
}