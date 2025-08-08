<?php

namespace App\Http\Controllers;

use App\Models\ItemLog;
use App\Models\Container;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItemLogController extends Controller
{
    // GET /api/itemlogs?container_id=&per_page=
    public function index(Request $request)
    {
        $q = ItemLog::query()->with(['container','product']);

        if ($request->filled('container_id')) {
            $q->where('container_id', (int) $request->input('container_id'));
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($q->paginate($perPage));
    }

    // POST /api/itemlogs  (dodavanje stavke u kontejner)
    public function store(Request $request)
    {
        $data = $request->validate([
            'container_id' => ['required','integer','exists:containers,id'],
            'product_id'   => ['required','integer','exists:products,id'],
            'quantity'     => ['required','integer','min:1'],
            'logged_at'    => ['nullable','date'],
        ]);

        $container = Container::findOrFail($data['container_id']);
        $product   = Product::findOrFail($data['product_id']);

        // 1) Provera supplier-a
        if ($product->supplier_id !== $container->supplier_id) {
            return response()->json([
                'message' => 'Product supplier does not match container supplier.'
            ], 422);
        }

        // 2) Provera volumena (da ne prekoračimo max_volume)
        $currentVolume = ItemLog::where('container_id', $container->id)
            ->join('products', 'products.id', '=', 'item_logs.product_id')
            ->sum(DB::raw('item_logs.quantity * products.volume'));

        $addedVolume = $data['quantity'] * $product->volume;

        if (($currentVolume + $addedVolume) > $container->max_volume) {
            return response()->json([
                'message' => 'Adding this item exceeds container max_volume.',
                'current_volume' => $currentVolume,
                'added_volume'   => $addedVolume,
                'max_volume'     => $container->max_volume,
            ], 422);
        }

        // 3) Transakcija: upis ItemLog + update total_cost
        $itemLog = null;

        DB::transaction(function () use (&$itemLog, $data, $container, $product) {
            $itemLog = ItemLog::create([
                'container_id' => $container->id,
                'product_id'   => $product->id,
                'quantity'     => $data['quantity'],
                'logged_at'    => $data['logged_at'] ?? now(),
            ]);

            $container->update([
                'total_cost' => $container->total_cost + ($data['quantity'] * $product->price),
            ]);
        });

        return response()->json($itemLog->load(['container','product']), 201);
    }

    // GET /api/itemlogs/{itemLog}
    public function show(ItemLog $itemLog)
    {
        return response()->json($itemLog->load(['container','product']));
    }

    // PUT/PATCH /api/itemlogs/{itemLog} (opciono ažuriranje količine)
    public function update(Request $request, ItemLog $itemLog)
    {
        $data = $request->validate([
            'quantity'  => ['sometimes','integer','min:1'],
            'logged_at' => ['sometimes','date'],
        ]);

        // Ako menjaš quantity, moraš prilagoditi total_cost i provere volumena.
        if (array_key_exists('quantity', $data)) {
            $delta = $data['quantity'] - $itemLog->quantity;

            if ($delta !== 0) {
                $product   = $itemLog->product;
                $container = $itemLog->container;

                // Provera volumena sa delta
                $currentVolume = ItemLog::where('container_id', $container->id)
                    ->join('products', 'products.id', '=', 'item_logs.product_id')
                    ->sum(DB::raw('item_logs.quantity * products.volume'));

                $newTotalVolume = $currentVolume + ($delta * $product->volume);
                if ($newTotalVolume > $container->max_volume) {
                    return response()->json([
                        'message' => 'Updating this item exceeds container max_volume.',
                    ], 422);
                }

                DB::transaction(function () use ($itemLog, $container, $product, $delta, $data) {
                    $itemLog->update($data);
                    // update total_cost
                    $container->update([
                        'total_cost' => $container->total_cost + ($delta * $product->price),
                    ]);
                });

                return response()->json($itemLog->fresh()->load(['container','product']));
            }
        }

        $itemLog->update($data);
        return response()->json($itemLog->fresh()->load(['container','product']));
    }

    // DELETE /api/itemlogs/{itemLog}
    public function destroy(ItemLog $itemLog)
    {
        DB::transaction(function () use ($itemLog) {
            $container = $itemLog->container;
            $product   = $itemLog->product;

            // smanji total_cost kontejnera
            $container->update([
                'total_cost' => $container->total_cost - ($itemLog->quantity * $product->price),
            ]);

            $itemLog->delete();
        });

        return response()->json(null, 204);
    }
}