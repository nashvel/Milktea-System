<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\UserModel;

class UserSeeder extends Seeder
{
    public function run()
    {
        $userModel = new UserModel();
        $data = [
            'email'    => 'testuser@example.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
        ];
        $userModel->save($data);
    }
} 