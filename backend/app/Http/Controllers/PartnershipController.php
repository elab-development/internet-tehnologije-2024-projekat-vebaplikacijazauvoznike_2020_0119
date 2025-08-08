<?php

namespace App\Http\Controllers;

use App\Models\Partnership;
use Illuminate\Http\Request;

class PartnershipController extends Controller
{
    public function index()
    {
        return response()->json(
            Partnership::with(['importer','supplier'])->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'importer_id' => ['required','integer','exists:importers,id'],
            'supplier_id' => ['required','integer','exists:suppliers,id'],
        ]);

        // unique par: importer_id + supplier_id (imamo unique u migraciji)
        $p = Partnership::create($data);

        return response()->json($p->load(['importer','supplier']), 201);
    }

    public function show(Partnership $partnership)
    {
        return response()->json($partnership->load(['importer','supplier']));
    }

    public function update(Request $request, Partnership $partnership)
    {
        $data = $request->validate([
            'importer_id' => ['sometimes','integer','exists:importers,id'],
            'supplier_id' => ['sometimes','integer','exists:suppliers,id'],
        ]);

        $partnership->update($data);
        return response()->json($partnership->load(['importer','supplier']));
    }

    public function destroy(Partnership $partnership)
    {
        $partnership->delete();
        return response()->json(null, 204);
    }
}