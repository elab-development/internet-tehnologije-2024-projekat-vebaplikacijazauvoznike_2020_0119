<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use App\Models\Container;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function summary(Request $request)
    {
        $importersCount = User::where('role', 'importer')->count();
        $suppliersCount = User::where('role', 'supplier')->count();
        $productsCount = Product::count();
        $shippedContainersCount = Container::where('status', 'shipped')->count();

        $ordersByMonth = Container::select(
                DB::raw('strftime("%Y-%m", created_at) as month'),
                DB::raw('count(id) as count')
            )
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        return response()->json([
            'importers_count' => $importersCount,
            'suppliers_count' => $suppliersCount,
            'products_count' => $productsCount,
            'shipped_containers_count' => $shippedContainersCount,
            'orders_by_month' => $ordersByMonth,
        ], 200);
    }
}