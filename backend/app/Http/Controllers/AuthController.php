<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use App\Models\Importer;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/register
    public function register(Request $request)
    {
        // 1) Validacija zajedničkih polja + uloge
        $base = $request->validate([
            'role'       => 'required|in:admin,importer,supplier',
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:8|confirmed', // očekuje password_confirmation
        ]);

        // 2) Dodatna, uslovna validacija po ulozi
        $extra = [];
        if (in_array($base['role'], ['importer', 'supplier'], true)) {
            $extra = $request->validate([
                'company_name' => 'required|string|max:255',
                'country'      => 'required|string|max:100',
            ]);
        } else {
            // admin — opcionalno može imati company/country, ali nisu obavezni
            $extra = $request->validate([
                'company_name' => 'nullable|string|max:255',
                'country'      => 'nullable|string|max:100',
            ]);
        }

        // 3) Kreiranje korisnika + profil tabele unutar transakcije
        $result = DB::transaction(function () use ($base, $extra) {
            // Kreiraj User
            $user = User::create([
                'name'     => $base['name'],
                'email'    => $base['email'],
                'password' => Hash::make($base['password']),
                'role'     => $base['role'],    // Uveri se da users tabela ima kolonu 'role'
            ]);

            // Kreiraj povezani profil zavisno od uloge
            switch ($base['role']) {
                case 'admin':
                    Log::info('CREATING_ADMIN', ['user_id' => $user->id, 'name' => $base['name']]);
                    Admin::create([
                        'user_id' => $user->id,
                        'name'    => $base['name'],
                    ]);
                    break;

                case 'importer':
                    Log::info('CREATING_IMPORTER', ['user_id' => $user->id]);
                    Importer::create([
                        'user_id'      => $user->id,
                        'company_name' => $extra['company_name'],
                        'country'      => $extra['country'],
                    ]);
                    break;

                case 'supplier':
                    Log::info('CREATING_SUPPLIER', ['user_id' => $user->id]);
                    Supplier::create([
                        'user_id'      => $user->id,
                        'company_name' => $extra['company_name'],
                        'country'      => $extra['country'],
                    ]);
                    break;
            }

            // 4) Token (Sanctum)
            $token = $user->createToken('api')->plainTextToken;

            return [
                'user'  => $user,
                'token' => $token,
            ];
        });

        return response()->json($result, 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => ['required','string','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'        => $user,
            'access_token'=> $token,
            'token_type'  => 'Bearer',
        ]);
    }

    // POST /api/logout (auth:sanctum)
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}