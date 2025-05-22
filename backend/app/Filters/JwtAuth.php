<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtAuth implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return Services::response()->setJSON(['error' => 'Missing or invalid Authorization header'])->setStatusCode(401);
        }

        $token = $matches[1];
        try {
            $key = getenv('jwt.secret');
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            // Optional: Attach user to request
            $request->user = $decoded;
        } catch (\Exception $e) {
            return Services::response()->setJSON(['error' => 'Invalid token'])->setStatusCode(401);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}
