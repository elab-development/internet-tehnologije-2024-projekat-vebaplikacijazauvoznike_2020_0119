<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Partnership;
use App\Models\Importer;
use App\Models\Supplier;

class PartnershipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $importers = Importer::all();
        $suppliers = Supplier::all();

        if ($importers->isEmpty() || $suppliers->isEmpty()) {
            $this->command->info('Skipping PartnershipSeeder: No importers or suppliers found.');
            return;
        }

        foreach ($importers as $importer) {
            // Ensure each importer partners with at least 2-3 random suppliers
            $numPartnerships = rand(2, min(3, $suppliers->count()));
            $randomSuppliers = $suppliers->random($numPartnerships);

            foreach ($randomSuppliers as $supplier) {
                Partnership::firstOrCreate([
                    'importer_id' => $importer->id,
                    'supplier_id' => $supplier->id,
                ]);
            }
        }
    }
}
