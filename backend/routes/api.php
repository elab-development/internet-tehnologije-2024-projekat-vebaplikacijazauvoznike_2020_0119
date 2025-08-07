<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// API ROUTES GO HERE

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ContainerController;
use App\Http\Controllers\ItemLogController;
use App\Http\Controllers\PartnershipController;

Route::apiResource('products', ProductController::class);
Route::apiResource('containers', ContainerController::class);
Route::apiResource('itemlogs', ItemLogController::class);
Route::apiResource('partnerships', PartnershipController::class);