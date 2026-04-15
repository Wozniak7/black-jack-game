<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'password' => 'required|string|min:4'
        ]);

        $user = User::where('name', $request->name)->first();
        if($user) {
            return response()->json(['error' => 'Usuário já existe'], 400);
        }

        // We use a fake email since the user only required 'name'
        $user = User::create([
            'name' => $request->name,
            'email' => $request->name . '@example.com',
            'password' => Hash::make($request->password),
            'chips' => 1000
        ]);

        Auth::login($user);

        return response()->json(['user' => $user]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'password' => 'required|string'
        ]);

        $user = User::where('name', $request->name)->first();
        if(!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }

        Auth::login($user);

        return response()->json(['user' => $user]);
    }

    public function updateChips(Request $request)
    {
        $request->validate([
            'chips' => 'required|integer'
        ]);

        $user = Auth::user();
        if(!$user) {
            return response()->json(['error' => 'Não autenticado'], 401);
        }

        $user->chips = $request->chips;
        $user->save();

        return response()->json(['status' => 'success', 'chips' => $user->chips]);
    }

    public function getStatus()
    {
        if(Auth::check()) {
            return response()->json(['user' => Auth::user()]);
        }
        return response()->json(['user' => null]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['status' => 'success']);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        if(!$user) {
            return response()->json(['error' => 'Não autenticado'], 401);
        }

        $rules = [];
        // Only validate if they are sending a new name
        if($request->name && $request->name !== $user->name) {
            $rules['name'] = 'required|string|unique:users,name';
        }
        if($request->password) {
            $rules['password'] = 'required|string|min:4';
        }

        $request->validate($rules);

        if($request->name) {
            $user->name = $request->name;
            // email is just a mock based on name
            $user->email = $request->name . '@example.com';
        }
        
        if($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['status' => 'success', 'user' => $user]);
    }
}
