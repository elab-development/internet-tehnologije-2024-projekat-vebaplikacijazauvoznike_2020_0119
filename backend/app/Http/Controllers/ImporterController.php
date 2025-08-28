<?php

namespace App\Http\Controllers;

use App\Models\Importer;
use Illuminate\Http\Request;

class ImporterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Importer::query()->with('user');

        if ($request->filled('q')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->string('q') . '%');
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'asc'); // Default to ascending

        if ($sortBy) {
            switch ($sortBy) {
                case 'name':
                    // Sort by user's name
                    $query->join('users', 'importers.user_id', '=', 'users.id')
                          ->orderBy('users.name', $sortOrder)
                          ->select('importers.*'); // Select importers columns to avoid conflicts
                    break;
                case 'country':
                    $query->orderBy('country', $sortOrder);
                    break;
            }
        } else {
            $query->orderByDesc('id'); // Default sort if no sort_by is provided
        }

        return response()->json($query->paginate(), 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Importer $importer)
    {
        return response()->json($importer->load('user'), 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Importer $importer)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
        ]);

        $importer->update([
            'company_name' => $request->company_name,
            'country' => $request->country,
        ]);

        return response()->json($importer->load('user'), 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Importer $importer)
    {
        $importer->user->delete(); // Assuming soft delete on user
        $importer->delete(); // Assuming soft delete on importer
        return response()->json(null, 204);
    }
}