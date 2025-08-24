<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\Importer;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * GET /api/suppliers
     * Query: q, per_page
     * Public route.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Supplier::query()->with('user'); // Eager load user

        if ($user->role === 'importer') {
            $importer = Importer::where('user_id', $user->id)->firstOrFail();
            $partnerIds = $importer->partnerships()->pluck('supplier_id');
            $query->whereIn('id', $partnerIds);
        } elseif ($user->role === 'supplier') {
            // Supplier vidi samo sebe
            $supplier = Supplier::where('user_id', $user->id)->firstOrFail();
            $query->where('id', $supplier->id);
        }
        // Admin nema ogranicenja

        if ($request->filled('q')) {
            $query->where('company_name', 'like', '%' . $request->string('q') . '%');
        }

        // Sorting
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'asc'); // Default to ascending

        if ($sortBy) {
            switch ($sortBy) {
                case 'name':
                    $query->orderBy('company_name', $sortOrder); // Sort by company_name
                    break;
                case 'country':
                    $query->orderBy('country', $sortOrder);
                    break;
            }
        } else {
            $query->orderByDesc('id'); // Default sort if no sort_by is provided
        }

        $perPage = (int) $request->input('per_page', 12);
        return response()->json($query->paginate($perPage), 200);
    }

    /**
     * GET /api/suppliers/{supplier}
     * Public route.
     */
    public function show(Supplier $supplier)
    {
        return response()->json($supplier->load('user'), 200); // Eager load user
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
        ]);

        $supplier->update($request->only(['company_name', 'country', 'subtitle'])); // Update supplier fields

        return response()->json($supplier->load('user'), 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->user->delete(); // Assuming soft delete on user
        $supplier->delete(); // Assuming soft delete on supplier
        return response()->json(null, 204);
    }
}