<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\Importer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $q = Product::query()->select('*')->with('supplier');

        if ($user->role === 'importer') {
            $importer = Importer::where('user_id', $user->id)->firstOrFail();
            $partnerIds = $importer->partnerships()->pluck('supplier_id');
            $q->whereIn('supplier_id', $partnerIds);
        } elseif ($user->role === 'supplier') {
            $supplier = Supplier::where('user_id', $user->id)->firstOrFail();
            $q->where('supplier_id', $supplier->id);
        }

        if ($request->filled('category')) {
            $q->where('category', $request->string('category'));
        }
        if ($request->filled('supplier_id')) {
            $q->where('supplier_id', (int) $request->input('supplier_id'));
        }
        if ($request->filled('q')) {
            $q->where('name', 'like', '%'.$request->string('q').'%');
        }

        if ($request->filled('price_min')) {
            $q->where('price', '>=', (float)$request->input('price_min'));
        }
        if ($request->filled('price_max')) {
            $q->where('price', '<=', (float)$request->input('price_max'));
        }
        if ($request->filled('volume_min')) {
            $q->where('volume', '>=', (float)$request->input('volume_min'));
        }
        if ($request->filled('volume_max')) {
            $q->where('volume', '<=', (float)$request->input('volume_max'));
        }

        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'asc');

        if ($sortBy) {
            switch ($sortBy) {
                case 'name':
                case 'volume':
                case 'price':
                    $q->orderBy($sortBy, $sortOrder);
                    break;
            }
        } else {
            $q->orderByDesc('id');
        }


        $perPage = (int) $request->input('per_page', 12);
        return response()->json($q->paginate($perPage), 200);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('supplier'), 200);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['supplier','admin'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($user->role === 'supplier') {
            $supplier = Supplier::where('user_id', $user->id)->first();
            if (!$supplier) {
                return response()->json(['message' => 'Supplier profile not found'], 422);
            }
            $supplierId = $supplier->id;
        } else {
            $request->validate(['supplier_id' => ['required','integer','exists:suppliers,id']]);
            $supplierId = (int) $request->input('supplier_id');
        }

        $data = $request->validate([
            'name'        => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'category'    => ['required','string','max:255'],
            'price'       => ['required','numeric','min:0'],
            'volume'      => ['required','numeric','min:0'],
            'image'       => ['nullable','image','mimes:jpeg,png,jpg,gif,svg,webp','max:20480'],
        ]);
        $data['supplier_id'] = $supplierId;

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        } else {
            $data['image_url'] = null;
        }

        unset($data['image']);

        $product = Product::create($data);

        return response()->json($product->load('supplier'), 201);
    }

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
            'image'       => ['sometimes','nullable','image','mimes:jpeg,png,jpg,gif,svg,webp','max:20480'],
            'supplier_id' => [
                Rule::requiredIf($user->role === 'admin' && $request->has('supplier_id')),
                'integer',
                'exists:suppliers,id'
            ],
        ]);

        if ($user->role === 'supplier') {
            unset($data['supplier_id']);
        }

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            if ($product->image_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
            }
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        }

        unset($data['image']);

        $product->update($data);
        return response()->json($product->fresh()->load('supplier'), 200);
    }

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

        if ($product->image_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
        }

        $product->delete();
        return response()->json(null, 204);
    }

    public function create() {}
    public function edit(Product $product) {}
}