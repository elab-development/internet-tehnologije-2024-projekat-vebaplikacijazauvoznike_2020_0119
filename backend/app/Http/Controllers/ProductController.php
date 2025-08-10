<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Query: category, supplier_id, q, per_page
     * Public route (definisano u routes).
     */
    public function index(Request $request)
    {
        $q = Product::query()->with('supplier');

        if ($request->filled('category')) {
            $q->where('category', $request->string('category'));
        }
        if ($request->filled('supplier_id')) {
            $q->where('supplier_id', (int) $request->input('supplier_id'));
        }
        if ($request->filled('q')) {
            $q->where('name', 'like', '%'.$request->string('q').'%');
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($q->orderByDesc('id')->paginate($perPage), 200);
    }

    /**
     * GET /api/products/{product}
     * Public route (definisano u routes).
     */
    public function show(Product $product)
    {
        return response()->json($product->load('supplier'), 200);
    }

    /**
     * POST /api/products
     * Protected: supplier ili admin.
     * Supplier uvek kreira za SVOJ supplier_id; admin mora da prosledi supplier_id.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['supplier','admin'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Odredi supplier_id zavisno od role
        if ($user->role === 'supplier') {
            $supplier = Supplier::where('user_id', $user->id)->first();
            if (!$supplier) {
                return response()->json(['message' => 'Supplier profile not found'], 422);
            }
            $supplierId = $supplier->id;
        } else {
            // admin eksplicitno prosleđuje supplier_id
            $request->validate([
                'supplier_id' => ['required','integer','exists:suppliers,id'],
            ]);
            $supplierId = (int) $request->input('supplier_id');
        }

        $data = $request->validate([
            'name'        => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'category'    => ['required','string','max:255'],
            'price'       => ['required','numeric','min:0'],
            'volume'      => ['required','numeric','min:0'],
            'image'       => ['nullable','string','max:255'],
        ]);
        $data['supplier_id'] = $supplierId;

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    /**
     * PUT/PATCH /api/products/{product}
     * Protected: supplier ili admin.
     * Supplier može menjati SAMO svoje proizvode i ne sme menjati supplier_id.
     * Admin može (opciono) promeniti supplier_id.
     */
    public function update(Request $request, Product $product)
    {
        $user = $request->user();
        if (!in_array($user->role, ['supplier','admin'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($user->role === 'supplier') {
            $supplier = Supplier::where('user_id', $user->id)->first();
            if (!$supplier || $product->supplier_id !== $supplier->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $data = $request->validate([
            'name'        => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'category'    => ['sometimes','string','max:255'],
            'price'       => ['sometimes','numeric','min:0'],
            'volume'      => ['sometimes','numeric','min:0'],
            'image'       => ['sometimes','nullable','string','max:255'],
            'supplier_id' => [
                Rule::requiredIf($user->role === 'admin' && $request->has('supplier_id')),
                'integer',
                'exists:suppliers,id'
            ],
        ]);

        // Supplier ne sme prebacivati proizvod drugom supplieru
        if ($user->role === 'supplier') {
            unset($data['supplier_id']);
        }

        $product->update($data);
        return response()->json($product->fresh(), 200);
    }

    /**
     * DELETE /api/products/{product}
     * Protected: supplier ili admin.
     */
    public function destroy(Request $request, Product $product)
    {
        $user = $request->user();
        if (!in_array($user->role, ['supplier','admin'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($user->role === 'supplier') {
            $supplier = Supplier::where('user_id', $user->id)->first();
            if (!$supplier || $product->supplier_id !== $supplier->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $product->delete();
        return response()->json(null, 204);
    }

    // Ne koristimo u API-u
    public function create() {}
    public function edit(Product $product) {}
}