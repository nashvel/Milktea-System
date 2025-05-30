<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('profile', 'UserController::profile', ['filter' => 'jwt']);

//Cors
$routes->options('(:any)', function() {
    return service('response')
        ->setStatusCode(200)
        ->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
        ->setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

//admin
$routes->post('register', 'AuthController::register');
$routes->post('login', 'AuthController::login');


//product
$routes->post('api/products', 'ProductController::create');
$routes->get('api/products', 'ProductController::index');
$routes->patch('api/products/(:num)/stock', 'ProductController::updateStock/$1');
$routes->patch('api/products/(:num)/price', 'ProductController::updatePrice/$1');
$routes->patch('api/products/(:num)/name', 'ProductController::updateName/$1');
$routes->patch('api/products/(:num)/category', 'ProductController::updateCategory/$1');
$routes->delete('api/products/(:num)', 'ProductController::delete/$1');

//sales 
$routes->post('api/sales', 'SalesController::create');

//dashboard
$routes->get('api/dashboard/sales-today', 'DashboardController::salesToday');
$routes->get('api/dashboard/orders-week', 'DashboardController::ordersThisWeek');
$routes->get('api/dashboard/top-selling', 'DashboardController::topSellingProduct');
$routes->get('api/dashboard/weekly-chart', 'DashboardController::weeklySalesChart');
$routes->get('api/dashboard/recent-orders', 'DashboardController::recentOrders');

//transactions
$routes->get('api/transactions', 'TransactionController::getAllTransactions');
$routes->post('api/transactions', 'TransactionController::createTransaction');

//ingredients
$routes->get('api/ingredients', 'Ingredients::index');
$routes->get('api/ingredients/(:num)', 'Ingredients::show/$1');
$routes->post('api/ingredients', 'Ingredients::create'); // Add new ingredient
$routes->post('api/ingredients/(:num)/restock', 'Ingredients::restock/$1');
$routes->post('api/ingredients/deduct-for-order', 'Ingredients::deductForOrder');
$routes->patch('api/ingredients/(:num)', 'Ingredients::update/$1');
