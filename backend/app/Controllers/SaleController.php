<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\SaleModel;
use App\Models\SaleItemModel;
use App\Models\ProductModel;

class SaleController extends ResourceController
{
    protected $saleModel;
    protected $saleItemModel;
    protected $productModel;

    public function __construct()
    {
        $this->saleModel = new SaleModel();
        $this->saleItemModel = new SaleItemModel();
        $this->productModel = new ProductModel();
    }

    // Handle checkout and create new sale
    public function checkout()
    {
        try {
            $json = $this->request->getJSON();
            
            if (!isset($json->items) || empty($json->items)) {
                return $this->failValidationError('Cart is empty');
            }

            // Start transaction
            $db = \Config\Database::connect();
            $db->transStart();

            // Create sale record
            $saleData = [
                'total_amount' => $json->total_amount,
                'sale_date' => date('Y-m-d H:i:s')
            ];
            
            $saleId = $this->saleModel->insert($saleData);

            // Create sale items
            foreach ($json->items as $item) {
                $saleItemData = [
                    'sale_id' => $saleId,
                    'product_id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->price,
                    'subtotal' => $item->price * $item->quantity
                ];
                
                $this->saleItemModel->insert($saleItemData);

                // Update product stock
                $product = $this->productModel->find($item->id);
                if ($product) {
                    $this->productModel->update($item->id, [
                        'stock' => $product['stock'] - $item->quantity
                    ]);
                }
            }

            // Complete transaction
            $db->transComplete();

            if ($db->transStatus() === false) {
                return $this->failServerError('Failed to process checkout');
            }

            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Checkout successful',
                'sale_id' => $saleId
            ]);

        } catch (\Exception $e) {
            return $this->failServerError('An error occurred: ' . $e->getMessage());
        }
    }

    // Get daily sales
    public function getDailySales()
    {
        $date = $this->request->getGet('date') ?? date('Y-m-d');
        $sales = $this->saleModel->getDailySales($date);
        
        return $this->respond([
            'status' => 'success',
            'data' => $sales
        ]);
    }

    // Get weekly sales
    public function getWeeklySales()
    {
        $endDate = date('Y-m-d');
        $startDate = date('Y-m-d', strtotime('-6 days'));
        
        $sales = $this->saleModel->getWeeklySales($startDate, $endDate);
        
        return $this->respond([
            'status' => 'success',
            'data' => $sales
        ]);
    }

    // Get monthly sales
    public function getMonthlySales()
    {
        $year = $this->request->getGet('year') ?? date('Y');
        $month = $this->request->getGet('month') ?? date('m');
        
        $sales = $this->saleModel->getMonthlySales($year, $month);
        
        return $this->respond([
            'status' => 'success',
            'data' => $sales
        ]);
    }

    // Get dashboard data
    public function getDashboardData()
    {
        $data = $this->saleModel->getDashboardData();
        
        return $this->respond([
            'status' => 'success',
            'data' => $data
        ]);
    }

    // Get detailed sale information
    public function getSaleDetails($saleId)
    {
        $sale = $this->saleModel->find($saleId);
        if (!$sale) {
            return $this->failNotFound('Sale not found');
        }

        $saleItems = $this->saleItemModel->getSaleItemsWithProducts($saleId);
        
        return $this->respond([
            'status' => 'success',
            'sale' => $sale,
            'items' => $saleItems
        ]);
    }
} 