<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ContainerController;
use App\Http\Controllers\ItemLogController;
use App\Http\Controllers\PartnershipController;

/*
|--------------------------------------------------------------------------
| Public (bez autentikacije)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/health', fn () => response()->json(['ok' => true]));

// Public pregled proizvoda
Route::apiResource('products', ProductController::class)->only(['index','show']);

/*
|--------------------------------------------------------------------------
| Protected (zahteva auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Ko sam ja (brza provera tokena)
    Route::get('/me', fn (Request $request) => $request->user());

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Products – izmene (supplier/admin)
    Route::post('/products',                 [ProductController::class, 'store']);
    Route::put('/products/{product}',        [ProductController::class, 'update']);
    Route::delete('/products/{product}',     [ProductController::class, 'destroy']);

    // Containers (CRUD) – koristi route-model binding {container}
    Route::get('/containers',                 [ContainerController::class, 'index']);
    Route::post('/containers',                [ContainerController::class, 'store']);
    Route::get('/containers/{container}',     [ContainerController::class, 'show']);
    Route::put('/containers/{container}',     [ContainerController::class, 'update']);
    Route::delete('/containers/{container}',  [ContainerController::class, 'destroy']);

    // Item logs – u kontekstu konkretnog kontejnera
    Route::get('/containers/{container}/items',  [ItemLogController::class, 'index']);
    Route::post('/containers/{container}/items', [ItemLogController::class, 'store']);

    // Partnerships
    Route::apiResource('partnerships', PartnershipController::class);
});