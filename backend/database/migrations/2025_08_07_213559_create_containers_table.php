<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('containers', function (Blueprint $table) {
        $table->id();
        $table->foreignId('importer_id')->constrained('importers')->onDelete('cascade');
        $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
        $table->decimal('total_cost', 10, 2)->default(0);
        $table->decimal('max_volume', 10, 2);
        $table->string('status')->default('pending');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('containers');
    }
};
