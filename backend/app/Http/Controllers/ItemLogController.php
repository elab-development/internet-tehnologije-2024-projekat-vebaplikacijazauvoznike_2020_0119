<?php

namespace App\Http\Controllers;

use App\Models\Container;
use App\Models\ItemLog;
use App\Models\Product;
use App\Models\Importer;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
     * GET /api/shipments
     * Vraća sve pošiljke (i pending i confirmed) za ulogovanog dobavljača.
     */
    public function allShipments(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'supplier') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $supplier = Supplier::where('user_id', $user->id)->firstOrFail();

        $shipments = ItemLog::with(['product', 'container.importer.user'])
            ->whereHas('product', function ($query) use ($supplier) {
                $query->where('supplier_id', $supplier->id);
            })
            // Više ne filtriramo po statusu ovde, uzimamo sve
            ->orderByDesc('updated_at') // Prikazujemo najnovije prvo
            ->paginate($request->input('per_page', 15));

        return response()->json($shipments, 200);
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
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
            'logged_at'  => ['nullable', 'date'],
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
            ->join('products', 'item_logs.product_id', '=', 'products.id')
            ->selectRaw('sum(item_logs.quantity*products.price) as cost')
            ->first();

        $container->update(['total_cost' => (float)($agg->cost ?? 0)]);

        return response()->json($log->load('product'), 201);
    }

    /**
     * POST /api/item-logs
     * Jednostavniji nacin za dodavanje. Automatski pronalazi ili kreira
     * aktivni kontejner za kombinaciju (importer, supplier).
     */
    public function storeItem(Request $request)
    {
        // KORAK 1: Početak metode
        Log::info('[DEBUG_STORE_ITEM] Metoda je pokrenuta.');

        $user = $request->user();
        if ($user->role !== 'importer') {
            return response()->json(['message' => 'Forbidden. Only importers can add items.'], 403);
        }

        // KORAK 2: Validacija
        Log::info('[DEBUG_STORE_ITEM] Pokrećem validaciju ulaznih podataka.');
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ]);
        Log::info('[DEBUG_STORE_ITEM] Validacija uspešna.', ['data' => $data]);

        // KORAK 3: Dohvatanje modela
        Log::info('[DEBUG_STORE_ITEM] Dohvatam Importer i Product modele.');
        $importer = Importer::where('user_id', $user->id)->firstOrFail();
        $product = Product::findOrFail($data['product_id']);
        $supplier_id = $product->supplier_id;
        Log::info('[DEBUG_STORE_ITEM] Modeli uspešno dohvaćeni.', ['importer_id' => $importer->id, 'product_id' => $product->id]);

        // KORAK 4: Provera partnerstva
        Log::info('[DEBUG_STORE_ITEM] Proveravam partnerstvo.');
        $hasPartnership = $importer->partnerships()->where('supplier_id', $supplier_id)->exists();
        if (!$hasPartnership) {
            return response()->json(['message' => 'Forbidden. No partnership with this supplier.'], 403);
        }
        Log::info('[DEBUG_STORE_ITEM] Partnerstvo postoji.');

        // KORAK 5: Dohvatanje ili kreiranje kontejnera
        Log::info('[DEBUG_STORE_ITEM] Pokušavam da pronađem ili kreiram kontejner.');

        // Proveri da li importer već ima aktivan kontejner
        $existingActiveContainer = Container::where(
            [
                'importer_id' => $importer->id,
                'status'      => 'active',
            ]
        )->first();

        if ($existingActiveContainer) {
            // Ako postoji aktivan kontejner, proveri da li je od istog dobavljača
            if ((int)$existingActiveContainer->supplier_id !== (int)$supplier_id) {
                return response()->json(['message' => 'You already have an active container with a different supplier. Please ship or clear it first.'], 422);
            }
            $container = $existingActiveContainer;
            Log::info('[DEBUG_STORE_ITEM] Postojeći kontejner pronađen.', ['container_id' => $container->id]);
        } else {
            // Ako ne postoji aktivan kontejner, kreiraj novi
            $container = Container::create(
                [
                    'importer_id' => $importer->id,
                    'supplier_id' => $supplier_id,
                    'status'      => 'active',
                    'max_volume'  => 1000.0,
                    'max_price'   => 10000.0,
                    'total_cost'  => 0,
                ]
            );
            Log::info('[DEBUG_STORE_ITEM] Novi kontejner kreiran.', ['container_id' => $container->id]);
        }

        // KORAK 6: Provera zapremine
        Log::info('[DEBUG_STORE_ITEM] Računam trenutnu zapreminu.');
        $currentVolume = $container->itemLogs()->join('products', 'item_logs.product_id', '=', 'products.id')
            ->sum(DB::raw('item_logs.quantity * products.volume'));
        Log::info('[DEBUG_STORE_ITEM] Trenutna zapremina izračunata.', ['current_volume' => $currentVolume]);

        $additionalVolume = $data['quantity'] * $product->volume;

        if ($currentVolume + $additionalVolume > $container->max_volume) {
            return response()->json(['message' => 'Not enough space in the container.'], 422);
        }
        Log::info('[DEBUG_STORE_ITEM] Provera zapremine uspešna.');

        // KORAK 7: Dodavanje loga (artikla)
        Log::info('[DEBUG_STORE_ITEM] Dodajem artikal u bazu (ItemLog).');
                // KORAK 7: Dodavanje loga (artikla)
        Log::info('[DEBUG_STORE_ITEM] Dodajem artikal u bazu (ItemLog).');
        $log = $container->itemLogs()->create([
            'product_id' => $product->id,
            'quantity'   => $data['quantity'],
            'logged_at'  => now(),
        ]);
        Log::info('[DEBUG_STORE_ITEM] Artikal uspešno dodat.', ['item_log_id' => $log->id, 'product_volume' => $product->volume, 'quantity' => $data['quantity']]);

        // KORAK 8: Preračunavanje cene i zapremine

        // KORAK 8: Preračunavanje cene i zapremine
        Log::info('[DEBUG_STORE_ITEM] Preračunavam ukupnu cenu i zapreminu kontejnera.');
        $newTotalCost = $container->itemLogs()->join('products', 'item_logs.product_id', '=', 'products.id')
            ->sum(DB::raw('item_logs.quantity * products.price'));
        $newTotalVolume = $container->itemLogs()->join('products', 'item_logs.product_id', '=', 'products.id')
            ->sum(DB::raw('item_logs.quantity * products.volume'));
        Log::info('[DEBUG_STORE_ITEM] Ukupna cena i zapremina izračunate.', ['new_total_cost' => $newTotalCost, 'new_total_volume' => $newTotalVolume]);

        // KORAK 9: Ažuriranje kontejnera
        Log::info('[DEBUG_STORE_ITEM] Ažuriram kontejner sa novom cenom i zapreminom.');
        $container->update(['total_cost' => $newTotalCost, 'total_volume' => $newTotalVolume]);
        Log::info('[DEBUG_STORE_ITEM] Kontejner uspešno ažuriran.');

        return response()->json($log->load('product'), 201);
    }

    /**
     * GET /api/item-logs/pending
     * Vraća sve stavke koje čekaju na potvrdu od strane ulogovanog suppliere-a.
     */
    public function pending(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'supplier') {
            return response()->json(['message' => 'Forbidden. Only suppliers can view pending items.'], 403);
        }

        $supplier = Supplier::where('user_id', $user->id)->firstOrFail();

        $pendingLogs = ItemLog::with(['product', 'container.importer'])
            ->whereHas('product', function ($query) use ($supplier) {
                $query->where('supplier_id', $supplier->id);
            })
            ->whereHas('container', function ($query) {
                $query->where('status', 'pending_shipping');
            })
            ->where('status', 'pending') // Status na samom item_log-u
            ->get();

        return response()->json($pendingLogs, 200);
    }

    /**
     * POST /api/item-logs/{item_log}/confirm
     * Supplier potvrđuje isporuku za određenu stavku.
     */
    public function confirm(Request $request, ItemLog $itemLog)
    {
        $user = $request->user();
        if ($user->role !== 'supplier') {
            return response()->json(['message' => 'Forbidden. Only suppliers can confirm items.'], 403);
        }

        $supplier = Supplier::where('user_id', $user->id)->firstOrFail();

        // Proveri da li ovaj item_log pripada proizvodu ovog suppliere-a
        if ((int)$itemLog->product->supplier_id !== (int)$supplier->id) {
            return response()->json(['message' => 'Forbidden. You do not own this item.'], 403);
        }

        if ($itemLog->status !== 'pending') {
            return response()->json(['message' => 'This item has already been handled.'], 422);
        }

        $itemLog->update(['status' => 'confirmed']);

        // Proveriti da li su sve stavke u kontejneru potvrdjene
        $container = $itemLog->container;
        $allConfirmed = $container->itemLogs()->where('status', '!=', 'confirmed')->doesntExist();

        if ($allConfirmed) {
            $container->update(['status' => 'shipped']);
        }

        return response()->json($itemLog, 200);
    }

    /**
     * GET /api/history/shipments
     * Vraća istoriju isporuka za ulogovanog suppliere-a.
     */
    public function shipmentHistory(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'supplier') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $supplier = Supplier::where('user_id', $user->id)->firstOrFail();

        $history = ItemLog::with(['product', 'container.importer.user'])
            ->whereHas('product', function ($query) use ($supplier) {
                $query->where('supplier_id', $supplier->id);
            })
            ->orderByDesc('updated_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($history, 200);
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

    /**
     * DELETE /api/item-logs/{item_log}
     * Dozvoli importer-u vlasniku (ili admin-u) da obriše stavku iz kontejnera.
     */
    public function destroy(Request $request, ItemLog $itemLog)
    {
        $user = $request->user();

        // Provera da li korisnik ima pravo da obriše ovaj itemLog
        // Importer može obrisati samo itemLog iz svog aktivnog kontejnera
        // Admin može obrisati bilo koji itemLog
        if ($user->role === 'importer') {
            $importer = Importer::where('user_id', $user->id)->firstOrFail();
            if ((int)$itemLog->container->importer_id !== (int)$importer->id || $itemLog->container->status !== 'active') {
                return response()->json(['message' => 'Forbidden. You can only delete items from your active container.'], 403);
            }
        } elseif ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Only importers or admins can delete item logs.'], 403);
        }

        $container = $itemLog->container; // Sačuvaj referencu na kontejner pre brisanja

        $itemLog->delete();

        // Re-izračunaj total_cost i total_volume kontejnera
        $newTotalCost = $container->itemLogs()->join('products', 'item_logs.product_id', '=', 'products.id')
            ->sum(DB::raw('item_logs.quantity * products.price'));

        $newTotalVolume = $container->itemLogs()->join('products', 'item_logs.product_id', '=', 'products.id')
            ->sum(DB::raw('item_logs.quantity * products.volume'));

        $container->update([
            'total_cost' => $newTotalCost,
            'total_volume' => $newTotalVolume
        ]);

        // Check if the container is now empty
        if ($container->itemLogs()->count() === 0) {
            $container->delete(); // Delete the container if it's empty
        }

        return response()->noContent(); // 204 No Content
    }
}
