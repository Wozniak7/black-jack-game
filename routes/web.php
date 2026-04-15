<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::post('/api/register', 'AuthController@register');
Route::post('/api/login', 'AuthController@login');
Route::post('/api/update-chips', 'AuthController@updateChips');
Route::post('/api/profile/update', 'AuthController@updateProfile');
Route::post('/api/logout', 'AuthController@logout');
Route::get('/api/status', 'AuthController@getStatus');
