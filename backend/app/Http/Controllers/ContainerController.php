<?php

namespace App\Http\Controllers;

use App\Models\Container;
use Illuminate\Http\Request;

class ContainerController extends Controller
{
    public function index()
    {
        // Vrati sve kontejnere
        return Container::all();
    }

    public function store(Request $request)
    {
        // Validacija unosa
        $validated = $request->validate([
            'importer_id' => 'required|exists:importers,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'total_cost' => 'required|numeric',
            'max_volume' => 'required|numeric',
            'status' => 'required|string'
        ]);

        // Kreiranje kontejnera
        $container = Container::create($validated);

        return response()->json($container, 201);
    }

    public function show($id)
    {
        // Pronađi kontejner po ID-ju
        return Container::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $container = Container::findOrFail($id);

        $validated = $request->validate([
            'total_cost' => 'nullable|numeric',
            'max_volume' => 'nullable|numeric',
            'status' => 'nullable|string'
        ]);

        $container->update($validated);

        return response()->json($container, 200);
    }

    public function destroy($id)
    {
        $container = Container::findOrFail($id);
        $container->delete();

        return response()->json(null, 204);
    }
}