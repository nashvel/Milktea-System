<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController extends ResourceController
{
    protected $format = 'json';

    public function register()
    {
        $rules = [
            'email' => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[6]',
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $model = new UserModel();
        $data = [
            'email' => $this->request->getVar('email'),
            'password' => password_hash($this->request->getVar('password'), PASSWORD_DEFAULT),
        ];

        $model->save($data);
        return $this->respondCreated(['message' => 'User registered']);
    }

    public function login()
    {
        $email = $this->request->getVar('email');
        $password = $this->request->getVar('password');

        $model = new UserModel();
        $user = $model->where('email', $email)->first();

        if (!$user || !password_verify($password, $user['password'])) {
            return $this->failUnauthorized('Invalid credentials');
        }

        $token = $this->generateJWT($user);

        return $this->respond([
            'message' => 'Login successful',
            'token'   => $token
        ]);
    }

    private function generateJWT($user)
    {
        $key = getenv('jwt.secret');
        $issuedAt = time();
        $expire = $issuedAt + 3600;

        $payload = [
            'iat'      => $issuedAt,
            'exp'      => $expire,
            'uid'      => $user['id'],
            'email'    => $user['email']
        ];

        return JWT::encode($payload, $key, 'HS256');
    }
}
