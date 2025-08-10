<?php

namespace App\Http\Controllers;

use App\Models\Container;
use App\Models\ItemLog;
use App\Models\Product;
use App\Models\Importer;
use App\Models\Supplier;
use Illuminate\Http\Request;

class ItemLogController extends Controller
{
    /**
     * GET /api/containers/{id}/items
     */
    public function index(Request $request, $id)
    {
        $container = Container::findOrFail($id);
        if (!$this->canSee($request->user(), $container)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $logs = ItemLog::with('product')
            ->where('container_id', $container->id)
            ->orderByDesc('logged_at')
            ->get();

        return response()->json($logs, 200);
    }

    /**
     * POST /api/containers/{id}/items
     * Dozvoli importer-u vlasniku (ili admin-u).
     * Validacije:
     * - product_id postoji
     * - product pripada supplieru koji je u kontejneru
     * - quantity > 0
     * - (opciono) update total_cost
     */
    public function store(Request $request, $id)
    {
        $container = Container::findOrFail($id);
        $user = $request->user();

        if (!$this->canModify($user, $container)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'product_id' => ['required','integer','exists:products,id'],
            'quantity'   => ['required','integer','min:1'],
            'logged_at'  => ['nullable','date'],
        ]);

        $product = Product::findOrFail($data['product_id']);

        // proizvod mora pripadati istom supplieru kao i kontejner
        if ((int)$product->supplier_id !== (int)$container->supplier_id) {
            return response()->json(['message' => 'Product does not belong to container supplier'], 422);
        }

        $data['container_id'] = $container->id;
        $data['logged_at']    = $data['logged_at'] ?? now();

        $log = ItemLog::create($data);

        // Re-izračunaj total_cost iz svih logova (jednostavno i sigurno)
        $agg = ItemLog::where('container_id', $container->id)
            ->join('products','item_logs.product_id','=','products.id')
            ->selectRaw('sum(item_logs.quantity*products.price) as cost')
            ->first();

        $container->update(['total_cost' => (float)($agg->cost ?? 0)]);

        return response()->json($log->load('product'), 201);
    }

    private function canSee($user, Container $container): bool
    {
        if ($user->role === 'admin') return true;
        if ($user->role === 'importer') {
            $impId = Importer::where('user_id', $user->id)->value('id');
            return (int)$container->importer_id === (int)$impId;
        }
        if ($user->role === 'supplier') {
            $supId = Supplier::where('user_id', $user->id)->value('id');
            return (int)$container->supplier_id === (int)$supId;
        }
        return false;
    }

    private function canModify($user, Container $container): bool
    {
        if ($user->role === 'admin') return true;
        if ($user->role === 'importer') {
            $impId = Importer::where('user_id', $user->id)->value('id');
            return (int)$container->importer_id === (int)$impId;
        }
        return false;
    }
}