<?php

namespace App\Http\Controllers;

use App\Models\Partnership;
use App\Models\Importer;
use App\Models\Supplier;
use Illuminate\Http\Request;

class PartnershipController extends Controller
{
    /**
     * GET /api/partnerships
     * admin -> sve
     * importer -> njegove
     * supplier -> njegove
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $q = Partnership::query()->with(['importer.user','supplier.user']);

        if ($user->role === 'importer') {
            $impId = Importer::where('user_id', $user->id)->value('id');
            $q->where('importer_id', $impId);
        } elseif ($user->role === 'supplier') {
            $supId = Supplier::where('user_id', $user->id)->value('id');
            $q->where('supplier_id', $supId);
        }

        return response()->json($q->get(), 200);
    }

    /**
     * POST /api/partnerships
     * Za jednostavnost: samo admin kreira/menja/briše.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message'=>'Forbidden'], 403);
        }

        $data = $request->validate([
            'importer_id' => ['required','integer','exists:importers,id'],
            'supplier_id' => ['required','integer','exists:suppliers,id'],
        ]);

        $p = Partnership::firstOrCreate($data);
        return response()->json($p->load(['importer.user','supplier.user']), 201);
    }

    /**
     * GET /api/partnerships/{id}
     */
    public function show(Request $request, $id)
    {
        $p = Partnership::with(['importer.user','supplier.user'])->findOrFail($id);

        if (! $this->canSee($request->user(), $p)) {
            return response()->json(['message'=>'Forbidden'], 403);
        }

        return response()->json($p, 200);
    }

    /**
     * PUT /api/partnerships/{id}
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message'=>'Forbidden'], 403);
        }

        $p = Partnership::findOrFail($id);

        $data = $request->validate([
            'importer_id' => ['sometimes','integer','exists:importers,id'],
            'supplier_id' => ['sometimes','integer','exists:suppliers,id'],
        ]);

        $p->update($data);
        return response()->json($p->load(['importer.user','supplier.user']), 200);
    }

    /**
     * DELETE /api/partnerships/{id}
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message'=>'Forbidden'], 403);
        }

        $p = Partnership::findOrFail($id);
        $p->delete();
        return response()->json(null, 204);
    }

    private function canSee($user, Partnership $p): bool
    {
        if ($user->role === 'admin') return true;
        if ($user->role === 'importer') {
            $impId = Importer::where('user_id',$user->id)->value('id');
            return (int)$p->importer_id === (int)$impId;
        }
        if ($user->role === 'supplier') {
            $supId = Supplier::where('user_id',$user->id)->value('id');
            return (int)$p->supplier_id === (int)$supId;
        }
        return false;
    }
}