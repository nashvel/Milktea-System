<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\ProductModel;

class DashboardController extends ResourceController
{
    use ResponseTrait;

    public function salesToday()
    {
        try {
            $db = \Config\Database::connect();
            
            // Get today's date in the correct format
            $today = date('Y-m-d');
            
            // Query to get sum of transaction total from the last 24 hours
            $query = $db->query("
                SELECT COALESCE(SUM(t.total), 0) as total_sales 
                FROM transactions t
                WHERE DATE(t.transaction_date) = ?", 
                [$today]
            );
            
            $result = $query->getRow();
            return $this->respond([
                'success' => true,
                'sales' => $result->total_sales
            ]);
            
        } catch (\Exception $e) {
            return $this->respond([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function ordersThisWeek()
    {
        try {
            $db = \Config\Database::connect();
            
            // Get today's date and date from 7 days ago
            $today = date('Y-m-d');
            $weekAgo = date('Y-m-d', strtotime('-7 days'));
            
            // Query to count orders from the last 7 days
            $query = $db->query("
                SELECT COUNT(*) as order_count 
                FROM transactions t
                WHERE DATE(t.transaction_date) BETWEEN ? AND ?", 
                [$weekAgo, $today]
            );
            
            $result = $query->getRow();
            return $this->respond([
                'success' => true,
                'orders' => $result->order_count
            ]);
            
        } catch (\Exception $e) {
            return $this->respond([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function topSellingProduct()
    {
        try {
            $db = \Config\Database::connect();
            
            // Query to get the product with highest quantity sold
            $query = $db->query("
                SELECT p.product_name, SUM(s.quantity) as total_quantity
                FROM sales s
                JOIN products p ON s.product_id = p.product_id
                GROUP BY p.product_name
                ORDER BY total_quantity DESC
                LIMIT 1
            ");
            
            $result = $query->getRow();
            
            if (!$result) {
                return $this->respond([
                    'success' => true,
                    'product' => 'No sales data'
                ]);
            }
            
            return $this->respond([
                'success' => true,
                'product' => $result->product_name
            ]);
            
        } catch (\Exception $e) {
            return $this->respond([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function weeklySalesChart()
    {
        try {
            $db = \Config\Database::connect();
            
            // Get dates for the last 7 days
            $days = [];
            $salesData = [];
            $dayLabels = [];
            
            // Get days of the week and their corresponding dates
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-$i days"));
                $dayName = date('l', strtotime("-$i days"));
                $days[] = $date;
                $dayLabels[] = $dayName;
                $salesData[$date] = 0; // Initialize with 0
            }
            
            // Query to get sales for each of the last 7 days
            $placeholders = implode(',', array_fill(0, count($days), '?'));
            $query = $db->query("
                SELECT DATE(t.transaction_date) as sale_date, COALESCE(SUM(t.total), 0) as daily_total
                FROM transactions t
                WHERE DATE(t.transaction_date) IN ($placeholders)
                GROUP BY DATE(t.transaction_date)
                ORDER BY DATE(t.transaction_date)
            ", $days);
            
            $results = $query->getResult();
            
            // Fill in the actual sales data
            foreach ($results as $row) {
                $salesData[$row->sale_date] = (float)$row->daily_total;
            }
            
            // Format data for the chart
            $chartData = [
                'labels' => $dayLabels,
                'data' => array_values($salesData)
            ];
            
            return $this->respond([
                'success' => true,
                'chartData' => $chartData
            ]);
            
        } catch (\Exception $e) {
            return $this->respond([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function recentOrders()
    {
        try {
            $db = \Config\Database::connect();
            
            // Try to get the latest 3 orders with product information
            $query = $db->query("
                SELECT 
                    t.transaction_id,
                    p.product_name,
                    s.quantity,
                    t.total
                FROM 
                    transactions t
                JOIN 
                    sales s ON t.transaction_id = s.transaction_id
                JOIN 
                    products p ON s.product_id = p.product_id
                ORDER BY 
                    t.transaction_date DESC
                LIMIT 3
            ");
            
            $results = $query->getResult();
            
            // If no transactions found, show recent products instead
            if (empty($results)) {
                // Get the most recently added products instead
                $productQuery = $db->query("
                    SELECT 
                        product_id as id,
                        product_name as product,
                        price as total,
                        1 as quantity
                    FROM 
                        products
                    ORDER BY 
                        product_id DESC
                    LIMIT 3
                ");
                
                $products = $productQuery->getResult();
                
                if (!empty($products)) {
                    return $this->respond([
                        'success' => true,
                        'orders' => $products,
                        'message' => 'Showing recent products as no orders found'
                    ]);
                }
            }
            
            // Format the response data from transactions
            $orders = [];
            foreach ($results as $row) {
                $orders[] = [
                    'id' => $row->transaction_id,
                    'product' => $row->product_name,
                    'quantity' => $row->quantity,
                    'total' => $row->total
                ];
            }
            
            return $this->respond([
                'success' => true,
                'orders' => $orders
            ]);
            
        } catch (\Exception $e) {
            return $this->respond([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 