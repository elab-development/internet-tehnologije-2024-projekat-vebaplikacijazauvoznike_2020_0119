<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// API ROUTES GO HERE

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ContainerController;
use App\Http\Controllers\ItemLogController;
use App\Http\Controllers\PartnershipController;
use App\Http\Controllers\AuthController;


Route::apiResource('products', ProductController::class);
Route::apiResource('containers', ContainerController::class);
Route::apiResource('itemlogs', ItemLogController::class);
Route::apiResource('partnerships', PartnershipController::class);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);