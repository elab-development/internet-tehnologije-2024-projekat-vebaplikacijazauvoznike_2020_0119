<?php

namespace App\Http\Controllers;

use App\Models\Container;
use App\Models\Importer;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContainerController extends Controller
{
    /**
     * GET /api/containers
     * Prikazuje kontejnere na osnovu uloge korisnika.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $q = Container::query()->with(['importer.user', 'supplier.user', 'itemLogs.product']);

        // Filtriranje po ulozi
        if ($user->role === 'importer') {
            $importerId = Importer::where('user_id', $user->id)->value('id');
            $q->where('importer_id', $importerId);
        } elseif ($user->role === 'supplier') {
            $supplierId = Supplier::where('user_id', $user->id)->value('id');
            $q->where('supplier_id', $supplierId);
        }

        // Apply status filtering
        if ($request->has('status')) {
            // If a direct 'status' is provided, use it
            $q->where('status', $request->input('status'));
        } elseif ($request->has('status_ne')) { // Use status_ne for 'not equal' to avoid array parsing issues
            // If 'status_ne' is provided, use 'not equal'
            $q->where('status', '!=', $request->input('status_ne'));
        }

        // Filter for shipment history: pending_shipping and shipped statuses
        $q->whereIn('status', ['pending_shipping', 'shipped']);

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($q->paginate($perPage), 200);
    }

    /**
     * POST /api/containers
     * Kreira novi kontejner, sa proverom da uvoznik može kreirati samo za sebe.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $forcedImporterId = null;
        if ($user->role === 'importer') {
            $forcedImporterId = Importer::where('user_id', $user->id)->value('id');
        }

        $data = $request->validate([
            'importer_id' => ['required', 'integer', 'exists:importers,id'],
            'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
            'max_volume'  => ['required', 'numeric', 'min:0'],
            'max_price'   => ['required', 'numeric', 'min:0'],
            'status'      => ['nullable', Rule::in(['pending', 'active', 'closed'])],
            'total_cost'  => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($forcedImporterId !== null && (int)$data['importer_id'] !== (int)$forcedImporterId) {
            return response()->json(['message' => 'Forbidden: importer mismatch'], 403);
        }

        // Postavljanje podrazumevanih vrednosti ako nisu poslate
        $data['status'] = $data['status'] ?? 'pending';
        $data['total_cost'] = $data['total_cost'] ?? 0;

        $container = Container::create($data);

        return response()->json($container, 201);
    }

    /**
     * GET /api/containers/{id}
     * Prikazuje specifičan kontejner uz proveru autorizacije.
     */
    public function show(Request $request, $id)
    {
        $container = Container::with(['importer.user', 'supplier.user', 'itemLogs.product'])->findOrFail($id);
        
        // Provera da li korisnik sme da vidi ovaj kontejner
        if (!$this->canSee($request->user(), $container)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json($container, 200);
    }

    /**
     * PUT /api/containers/{id}
     * Ažurira kontejner, uz proveru da samo vlasnik (ili admin) može da ga menja.
     */
    public function update(Request $request, $id)
    {
        $container = Container::findOrFail($id);
        $user = $request->user();

        // Provera da li korisnik sme da menja ovaj kontejner
        if (! $this->canModify($user, $container)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'max_volume' => ['sometimes', 'numeric', 'min:0'],
            'max_price'  => ['sometimes', 'numeric', 'min:0'],
            'status'     => ['sometimes', Rule::in(['pending', 'active', 'closed'])],
            // Samo admin može ručno da menja ukupnu cenu
            'total_cost' => $user->role === 'admin' ? ['sometimes', 'numeric', 'min:0'] : ['prohibited'],
        ]);

        $container->update($data);
        return response()->json($container, 200);
    }

    /**
     * DELETE /api/containers/{id}
     * Briše kontejner, uz proveru da samo vlasnik (ili admin) može da ga obriše.
     */
    public function destroy(Request $request, $id)
    {
        $container = Container::findOrFail($id);
        $user = $request->user();

        if (! $this->canModify($user, $container)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $container->delete();
        return response()->json(null, 204);
    }

    /**
     * GET /api/containers/current
     * Dohvata aktivni kontejner za ulogovanog uvoznika.
     */
    public function current(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'importer') {
            return response()->json(['message' => 'Only importers can have an active container.'], 403);
        }

        $importer = Importer::where('user_id', $user->id)->firstOrFail();

        $container = Container::with(['itemLogs.product', 'supplier'])
            ->where('importer_id', $importer->id)
            ->where('status', 'active')
            ->first();

        // Ključna popravka: Ako kontejner ne postoji, vrati null.
        // Frontend će prikazati poruku da je kontejner prazan.
        if (!$container) {
            return response()->json(null, 200);
        }

        return response()->json($container, 200);
    }

    /**
     * POST /api/containers/{container}/ship
     * Menja status kontejnera u 'pending_shipping'.
     */
    public function ship(Request $request, Container $container)
    {
        $user = $request->user();
        if ($user->role !== 'importer') {
            return response()->json(['message' => 'Only importers can ship containers.'], 403);
        }

        $importer = Importer::where('user_id', $user->id)->firstOrFail();
        if ((int)$container->importer_id !== (int)$importer->id) {
            return response()->json(['message' => 'Forbidden. You do not own this container.'], 403);
        }

        // Provera da li je kontejner u 'active' statusu pre slanja
        if ($container->status !== 'active') {
            return response()->json(['message' => 'Only active containers can be shipped.'], 422);
        }

        $container->update(['status' => 'pending_shipping']);

        return response()->json($container, 200);
    }

    /**
     * POST /api/containers/{container}/accept
     * Supplier accepts the shipment, changing container status to 'shipped'.
     */
    public function acceptShipment(Request $request, Container $container)
    {
        $user = $request->user();
        if ($user->role !== 'supplier') {
            return response()->json(['message' => 'Forbidden. Only suppliers can accept shipments.'], 403);
        }

        $supplier = Supplier::where('user_id', $user->id)->firstOrFail();

        // Provera da li kontejner pripada ovom dobavljaču
        if ((int)$container->supplier_id !== (int)$supplier->id) {
            return response()->json(['message' => 'Forbidden. This container does not belong to you.'], 403);
        }

        // Provera da li je kontejner u statusu koji se može prihvatiti (npr. 'pending_shipping')
        if ($container->status !== 'pending_shipping') {
            return response()->json(['message' => 'This shipment cannot be accepted in its current status.'], 422);
        }

        // Ažuriraj status kontejnera na 'shipped'
        $container->update(['status' => 'shipped']);

        // Ažuriraj status svih item_logova u ovom kontejneru na 'shipped'
        $container->itemLogs()->update(['status' => 'shipped']);

        return response()->json($container->load(['itemLogs', 'importer.user', 'supplier.user']), 200);
    }

    /**
     * Pomoćna funkcija za proveru da li korisnik sme da VIDI kontejner.
     */
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

    /**
     * Pomoćna funkcija za proveru da li korisnik sme da MENJA kontejner.
     */
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