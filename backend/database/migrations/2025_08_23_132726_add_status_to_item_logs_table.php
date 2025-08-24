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
        Schema::table('item_logs', function (Blueprint $table) {
            // Dodajemo 'status' kolonu.
            // Svaki novi artikal će automatski dobiti status 'pending'.
            $table->string('status')->default('pending')->after('logged_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_logs', function (Blueprint $table) {
            // Definišemo kako da se ukloni kolona ako radimo rollback migracije.
            $table->dropColumn('status');
        });
    }
};