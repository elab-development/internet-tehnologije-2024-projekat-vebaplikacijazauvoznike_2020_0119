<?php

namespace Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ContainerController;
use App\Http\Controllers\ItemLogController;
use App\Http\Controllers\PartnershipController;
use App\Http\Controllers\ImporterController;
use App\Http\Controllers\AnalyticsController;

/*
|--------------------------------------------------------------------------
| Public (bez autentikacije)
|--------------------------------------------------------------------------
*/


Route::get('/ping', function () {
    return response()->json(['ok' => true]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/health', fn() => response()->json(['ok' => true]));
Route::get('/me',        [AuthController::class, 'me'])->middleware('auth:sanctum');

// Public pregled
Route::apiResource('products', ProductController::class)->only(['index', 'show']);

/*
|--------------------------------------------------------------------------
| Protected (zahteva auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Ko sam ja (brza provera tokena)
    Route::get('/me', fn(Request $request) => $request->user());

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::delete('/profile', [AuthController::class, 'deleteProfile']);
    Route::delete('/profile', [AuthController::class, 'deleteProfile']);

    // Products - pregled (sada zasticen)
    Route::get('/products', [ProductController::class, 'index']);

    // Suppliers - pregled (sada zasticen)
    Route::apiResource('suppliers', SupplierController::class)->only(['index', 'show', 'update', 'destroy']);

    // Importers - pregled (sada zasticen)
    Route::apiResource('importers', ImporterController::class)->only(['index', 'show', 'update', 'destroy']);

    // Products – izmene (supplier/admin)
    Route::post('/products',                 [ProductController::class, 'store']);
    Route::put('/products/{product}',        [ProductController::class, 'update']);
    Route::delete('/products/{product}',     [ProductController::class, 'destroy']);

    // Containers (CRUD)
    Route::get('/containers',                 [ContainerController::class, 'index']);
    Route::post('/containers',                [ContainerController::class, 'store']);

    // SPECIFIČNA RUTA PRVO: Ispravan redosled
    Route::get('/containers/current', [ContainerController::class, 'current']);

    // GENERIČKA RUTA POSLE: koristi route-model binding {container}
    Route::get('/containers/{container}',     [ContainerController::class, 'show']);
    Route::put('/containers/{container}',     [ContainerController::class, 'update']);
    Route::delete('/containers/{container}',  [ContainerController::class, 'destroy']);

    // Ruta za slanje/isporuku kontejnera
    Route::post('/containers/{container}/ship', [ContainerController::class, 'ship']);

    // Ruta za prihvatanje pošiljke od strane dobavljača (novi zahtev)
    Route::post('/containers/{container}/accept', [ContainerController::class, 'acceptShipment']);

    // Item logs – u kontekstu konkretnog kontejnera
    Route::get('/containers/{container}/items',  [ItemLogController::class, 'index']);
    Route::post('/containers/{container}/items', [ItemLogController::class, 'store']);

    // Jednostavnija ruta za dodavanje itema u aktivni kontejner
    Route::post('/item-logs', [ItemLogController::class, 'storeItem']);

    // Ruta za dobavljanje pending stavki za suppliere
    Route::get('/item-logs/pending', [ItemLogController::class, 'pending']);

    // Ruta za potvrdu isporuke od strane suppliere-a
    Route::post('/item-logs/{item_log}/confirm', [ItemLogController::class, 'confirm']);

    // Ruta za brisanje stavke iz kontejnera
    Route::delete('/item-logs/{item_log}', [ItemLogController::class, 'destroy']);

    // Ruta za istoriju isporuka za suppliera
    Route::get('/history/shipments', [ItemLogController::class, 'shipmentHistory']);

    // Ruta za dobavljanje SVIH pošiljki (pending i confirmed) za suppliere-a
    Route::get('/shipments', [ItemLogController::class, 'allShipments']);

    // Admin rute
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);

    // Partnerships
    Route::apiResource('partnerships', PartnershipController::class);

    Route::get('/whoami', function (Illuminate\Http\Request $request) {
        $u   = $request->user();
        $imp = \App\Models\Importer::where('user_id', $u->id)->first();
        $sup = \App\Models\Supplier::where('user_id', $u->id)->first();

        return [
            'user_id'      => $u->id,
            'role'         => $u->role,
            'importer_id'  => optional($imp)->id,
            'supplier_id'  => optional($sup)->id,
        ];
    });
});