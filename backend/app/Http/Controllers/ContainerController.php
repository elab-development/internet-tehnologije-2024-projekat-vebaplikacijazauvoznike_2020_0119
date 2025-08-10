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
     * admin  -> svi
     * importer -> samo njegovi
     * supplier -> gde je on supplier
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $q = Container::query()->with(['importer.user','supplier.user']);

        if ($user->role === 'importer') {
            $importerId = Importer::where('user_id', $user->id)->value('id');
            $q->where('importer_id', $importerId);
        } elseif ($user->role === 'supplier') {
            $supplierId = Supplier::where('user_id', $user->id)->value('id');
            $q->where('supplier_id', $supplierId);
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($q->paginate($perPage), 200);
    }

    /**
     * POST /api/containers
     * importer može da kreira SAMO za sebe; admin može za bilo kog.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Ako je importer, zakucaj importer_id na njegov
        $forcedImporterId = null;
        if ($user->role === 'importer') {
            $forcedImporterId = Importer::where('user_id', $user->id)->value('id');
        }

        $data = $request->validate([
            'importer_id' => ['required','integer','exists:importers,id'],
            'supplier_id' => ['required','integer','exists:suppliers,id'],
            'max_volume'  => ['required','numeric','min:0'],
            'status'      => ['nullable', Rule::in(['pending','active','closed'])],
            'total_cost'  => ['nullable','numeric','min:0'],
        ]);

        if ($forcedImporterId !== null && (int)$data['importer_id'] !== (int)$forcedImporterId) {
            return response()->json(['message'=>'Forbidden: importer mismatch'], 403);
        }

        // default vrednosti
        $data['status'] = $data['status'] ?? 'pending';
        $data['total_cost'] = $data['total_cost'] ?? 0;

        $container = Container::create($data);

        return response()->json($container, 201);
    }

    /**
     * GET /api/containers/{id}
     */
    public function show(Request $request, $id)
    {
        $container = Container::with(['importer.user','supplier.user','itemLogs.product'])->findOrFail($id);
        if (!$this->canSee($request->user(), $container)) {
            return response()->json(['message'=>'Forbidden'], 403);
        }
        return response()->json($container, 200);
    }

    /**
     * PUT /api/containers/{id}
     * importer može da menja samo svoje; supplier ne menja kontejnere;
     * admin može sve. (Supplier eventualno može status da vidi, ali ne i da menja.)
     */
    public function update(Request $request, $id)
    {
        $container = Container::findOrFail($id);
        $user = $request->user();

        if (! $this->canModify($user, $container)) {
            return response()->json(['message'=>'Forbidden'], 403);
        }

        $data = $request->validate([
            'max_volume' => ['sometimes','numeric','min:0'],
            'status'     => ['sometimes', Rule::in(['pending','active','closed'])],
            // total_cost se računa iz ItemLog-ova; dozvoli admin-u da ručno koriguje po potrebi
            'total_cost' => $user->role === 'admin' ? ['sometimes','numeric','min:0'] : ['prohibited'],
        ]);

        $container->update($data);
        return response()->json($container, 200);
    }

    /**
     * DELETE /api/containers/{id}
     * admin ili importer vlasnik
     */
    public function destroy(Request $request, $id)
    {
        $container = Container::findOrFail($id);

        $user = $request->user();
        if (! $this->canModify($user, $container)) {
            return response()->json(['message'=>'Forbidden'], 403);
        }

        $container->delete();
        return response()->json(null, 204);
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