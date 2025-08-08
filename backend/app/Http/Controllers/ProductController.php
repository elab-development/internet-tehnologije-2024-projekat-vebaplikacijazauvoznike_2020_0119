<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Opcioni query parametri: category, supplier_id, per_page
     */
    public function index(Request $request)
    {
        $q = Product::query();

        if ($request->filled('category')) {
            $q->where('category', $request->string('category'));
        }

        if ($request->filled('supplier_id')) {
            $q->where('supplier_id', (int) $request->input('supplier_id'));
        }

        $perPage = (int) $request->input('per_page', 10);

        return response()->json($q->paginate($perPage), 200);
    }

    /**
     * POST /api/products
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => ['required','integer','exists:suppliers,id'],
            'name'        => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'category'    => ['required','string','max:255'],
            'price'       => ['required','numeric','min:0'],
            'volume'      => ['required','numeric','min:0'],
            'image'       => ['nullable','string','max:255'],
        ]);

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    /**
     * GET /api/products/{product}
     */
    public function show(Product $product)
    {
        return response()->json($product, 200);
    }

    /**
     * PUT/PATCH /api/products/{product}
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'supplier_id' => ['sometimes','integer','exists:suppliers,id'],
            'name'        => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'category'    => ['sometimes','string','max:255'],
            'price'       => ['sometimes','numeric','min:0'],
            'volume'      => ['sometimes','numeric','min:0'],
            'image'       => ['sometimes','nullable','string','max:255'],
        ]);

        $product->update($data);

        return response()->json($product, 200);
    }

    /**
     * DELETE /api/products/{product}
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }

    // Nisu potrebne za API, pa ostaju neiskorišćene:
    public function create() {}
    public function edit(Product $product) {}
}