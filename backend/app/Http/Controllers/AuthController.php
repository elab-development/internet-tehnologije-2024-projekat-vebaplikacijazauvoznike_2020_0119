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
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Registracija korisnika
    public function register(Request $request)
    {
        // Osnovna validacija
        $data = $request->validate([
            'role'         => ['required','in:admin,importer,supplier'],
            'name'         => ['nullable','string','max:255'],     // admin
            'company_name' => ['nullable','string','max:255'],     // importer/supplier
            'country'      => ['nullable','string','max:100'],     // importer/supplier
            'email'        => ['required','email','unique:users,email'],
            'password'     => ['required', Password::min(8)],
        ]);

        // Dodatna, uslovna validacija
        if ($data['role'] === 'admin') {
            $request->validate(['name' => ['required','string','max:255']]);
        } else {
            $request->validate([
                'company_name' => ['required','string','max:255'],
                'country'      => ['required','string','max:100'],
            ]);
        }

        // Transakcija: kreiraj User + povezani model
        $result = DB::transaction(function () use ($request, $data) {
            // Kreiraj korisnika
            $user = User::create([
                'name'     => $request->input('name'),
                'email'    => $request->input('email'),
                'password' => Hash::make($request->input('password')),
                'role'     => $data['role'],
            ]);

            // Kreiraj povezani zapis po ulozi
            if ($data['role'] === 'admin') {
                Log::info('CREATING_ADMIN', ['user_id' => $user->id, 'name' => $request->input('name')]);
                Admin::create([
                    'user_id' => $user->id,
                    'name'    => $request->input('name'),
                ]);
            } elseif ($data['role'] === 'importer') {
                Log::info('CREATING_IMPORTER', ['user_id' => $user->id]);
                Importer::create([
                    'user_id'      => $user->id,
                    'company_name' => $request->input('company_name'),
                    'country'      => $request->input('country'),
                ]);
            } else { // supplier
                Log::info('CREATING_SUPPLIER', ['user_id' => $user->id]);
                Supplier::create([
                    'user_id'      => $user->id,
                    'company_name' => $request->input('company_name'),
                    'country'      => $request->input('country'),
                ]);
            }

            // Kreiraj token (Sanctum)
            $token = $user->createToken('api')->plainTextToken;

            return ['user' => $user, 'token' => $token];
        });

        return response()->json($result, 201);
    }

    // Login korisnika
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

        // Kreiraj token
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    // Logout korisnika
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}