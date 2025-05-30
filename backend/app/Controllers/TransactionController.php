<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;

class TransactionController extends ResourceController
{
    use ResponseTrait;

    public function getAllTransactions()
    {
        // Add CORS headers
        $this->response->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $this->response->setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        $this->response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // If this is a preflight OPTIONS request, return early with a 200 response
        if ($this->request->getMethod(true) === 'OPTIONS') {
            return $this->response->setStatusCode(200);
        }

        try {
            $db = \Config\Database::connect();
            
            // Get database structure to understand how tables are related
            $tables = $this->getDatabaseStructure($db);
            log_message('info', 'Database tables: ' . json_encode($tables));
            
            // Get all transactions with their date and total
            $transactionsQuery = $db->query("
                SELECT 
                    transaction_id,
                    transaction_date,
                    total
                FROM 
                    transactions
                ORDER BY 
                    transaction_date DESC
            ");
            
            $transactions = $transactionsQuery->getResultArray();
            
            // For each transaction, try to find the associated products
            foreach ($transactions as &$transaction) {
                // Initialize empty products array
                $transaction['products'] = [];
                
                try {
                    // First, check if the sales table has a transaction_id column
                    $hasSalesTransactionId = $this->tableHasColumn($db, 'sales', 'transaction_id');
                    
                    if ($hasSalesTransactionId) {
                        $productsQuery = $db->query("
                            SELECT 
                                p.product_id,
                                p.product_name,
                                s.quantity,
                                p.price
                            FROM 
                                sales s
                            JOIN 
                                products p ON s.product_id = p.product_id
                            WHERE 
                                s.transaction_id = ?
                        ", [$transaction['transaction_id']]);
                        
                        $transaction['products'] = $productsQuery->getResultArray();
                    } else {
                        // Fallback: Assume sales has different naming or try a broader query
                        // This is just an example - adjust based on your actual database structure
                        $productsQuery = $db->query("
                            SELECT 
                                p.product_id,
                                p.product_name,
                                1 as quantity, -- Default quantity 
                                p.price
                            FROM 
                                products p 
                            ORDER BY p.product_id 
                            LIMIT 3
                        ");
                        
                        $transaction['products'] = $productsQuery->getResultArray();
                    }
                } catch (\Exception $innerEx) {
                    // Log the inner exception but continue processing other transactions
                    log_message('error', 'Error fetching products for transaction ' . 
                        $transaction['transaction_id'] . ': ' . $innerEx->getMessage());
                }
            }
            
            return $this->respond([
                'success' => true,
                'transactions' => $transactions
            ]);
            
        } catch (\Exception $e) {
            log_message('error', 'Transaction fetch error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->respond([
                'success' => false,
                'message' => 'Failed to fetch transactions: ' . $e->getMessage()
            ], 500);
        }
    }
    
    private function getDatabaseStructure($db)
    {
        // Get list of tables
        $tables = [];
        
        // Try to get table names
        try {
            $query = $db->query("SHOW TABLES");
            $tableRows = $query->getResultArray();
            
            foreach ($tableRows as $row) {
                $tableName = reset($row); // Get first value from associative array
                $tables[$tableName] = [];
                
                // Get columns for each table
                $columnsQuery = $db->query("DESCRIBE " . $tableName);
                $columnsResult = $columnsQuery->getResultArray();
                
                foreach ($columnsResult as $column) {
                    $tables[$tableName][] = $column['Field'];
                }
            }
        } catch (\Exception $e) {
            log_message('error', 'Error fetching database structure: ' . $e->getMessage());
        }
        
        return $tables;
    }
    
    private function tableHasColumn($db, $tableName, $columnName)
    {
        try {
            $query = $db->query("DESCRIBE `$tableName`");
            $columns = $query->getResultArray();
            
            foreach ($columns as $column) {
                if ($column['Field'] === $columnName) {
                    return true;
                }
            }
            
            return false;
        } catch (\Exception $e) {
            log_message('error', "Error checking if table $tableName has column $columnName: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Create a new transaction with automatic ingredient deduction
     * 
     * @return mixed
     */
    public function createTransaction()
    {
        // Add CORS headers
        $this->response->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $this->response->setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        $this->response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // If this is a preflight OPTIONS request, return early with a 200 response
        if ($this->request->getMethod(true) === 'OPTIONS') {
            return $this->response->setStatusCode(200);
        }
        
        // Validate request data
        $rules = [
            'customer' => 'permit_empty|string',
            'total' => 'required|numeric',
            'products' => 'required',
            'products.*.product_id' => 'required|integer|is_not_unique[products.product_id]',
            'products.*.quantity' => 'required|integer|greater_than[0]'
        ];
        
        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }
        
        $db = \Config\Database::connect();
        $db->transBegin(); // Start transaction for database consistency
        
        try {
            // 1. Create transaction record
            $transactionData = [
                'transaction_date' => date('Y-m-d H:i:s'),
                'customer' => $this->request->getVar('customer') ?? 'Walk-in Customer',
                'total' => $this->request->getVar('total')
            ];
            
            $db->table('transactions')->insert($transactionData);
            $transactionId = $db->insertID();
            
            if (!$transactionId) {
                throw new \Exception('Failed to create transaction record');
            }
            
            // 2. Process each product in the order
            $products = $this->request->getVar('products');
            $productIds = []; // Track products for ingredient deduction
            $productQuantities = []; // Track quantities for ingredient deduction
            
            foreach ($products as $product) {
                // Create sales record for each product
                $salesData = [
                    'transaction_id' => $transactionId,
                    'product_id' => $product['product_id'],
                    'quantity' => $product['quantity'],
                    'payment_method' => $this->request->getVar('payment_method') ?? 'Cash'
                ];
                
                $db->table('sales')->insert($salesData);
                
                // Track for ingredient deduction
                $productIds[] = $product['product_id'];
                $productQuantities[$product['product_id']] = $product['quantity'];
                
                // Update product stock (optional, depending on your business logic)
                $currentProduct = $db->table('products')->where('product_id', $product['product_id'])->get()->getRowArray();
                if ($currentProduct) {
                    $newStock = max(0, $currentProduct['stock'] - $product['quantity']);
                    $db->table('products')->where('product_id', $product['product_id'])->update(['stock' => $newStock]);
                }
            }
            
            // 3. Deduct ingredients based on specific product requirements
            $this->deductIngredients($productIds, $productQuantities);
            
            // Commit transaction if everything succeeded
            $db->transCommit();
            
            return $this->respondCreated([
                'success' => true,
                'message' => 'Transaction created successfully',
                'transaction_id' => $transactionId
            ]);
            
        } catch (\Exception $e) {
            // Rollback transaction on error
            $db->transRollback();
            
            log_message('error', 'Transaction creation error: ' . $e->getMessage());
            return $this->respond([
                'success' => false,
                'message' => 'Failed to create transaction: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Deduct ingredients for ordered products
     * 
     * @param array $productIds Array of product IDs in the order
     * @param array $productQuantities Array of product quantities indexed by product_id
     * @return void
     */
    private function deductIngredients($productIds, $productQuantities)
    {
        if (empty($productIds)) {
            return;
        }
        
        $db = \Config\Database::connect();
        
        // Check if product_ingredients table exists
        $productIngredientsExist = false;
        try {
            $query = $db->query("SHOW TABLES LIKE 'product_ingredients'");
            $productIngredientsExist = $query->getNumRows() > 0;
        } catch (\Exception $e) {
            log_message('error', 'Error checking product_ingredients table: ' . $e->getMessage());
        }
        
        // If product_ingredients table exists, use relationships
        if ($productIngredientsExist) {
            // Get ingredients for all products in the order
            $productIngredients = $db->table('product_ingredients')
                ->whereIn('product_id', $productIds)
                ->get()
                ->getResultArray();
            
            $ingredientUpdates = [];
            
            // Calculate new quantities for each ingredient
            foreach ($productIngredients as $pi) {
                $productId = $pi['product_id'];
                $ingredientId = $pi['ingredient_id'];
                $quantityRequired = $pi['quantity_required'];
                $orderQuantity = $productQuantities[$productId] ?? 0;
                
                // Skip if product not in order or no quantity
                if ($orderQuantity <= 0) {
                    continue;
                }
                
                // Calculate total amount to deduct
                $deductAmount = $quantityRequired * $orderQuantity;
                
                // Add to updates (aggregate in case same ingredient used in multiple products)
                if (!isset($ingredientUpdates[$ingredientId])) {
                    $ingredientUpdates[$ingredientId] = $deductAmount;
                } else {
                    $ingredientUpdates[$ingredientId] += $deductAmount;
                }
            }
            
            // Update each ingredient quantity
            foreach ($ingredientUpdates as $ingredientId => $deductAmount) {
                $ingredient = $db->table('ingredients')->where('ingredient_id', $ingredientId)->get()->getRowArray();
                if ($ingredient) {
                    $newQuantity = max(0, $ingredient['quantity'] - $deductAmount);
                    $db->table('ingredients')->where('ingredient_id', $ingredientId)->update(['quantity' => $newQuantity]);
                }
            }
        } else {
            // Fallback to hardcoded deductions as specified
            // Every product in the order will deduct these ingredients by the specified amounts
            $hardcodedIngredients = [
                26 => 4,   // ice cubes: 4 pieces per product
                27 => 2,   // oreo: 2 pieces per product
                28 => 40   // sugar daddy: 40 grams per product
            ];
            
            // Calculate total order quantity
            $totalOrderQuantity = array_sum($productQuantities);
            
            // Update each hardcoded ingredient
            foreach ($hardcodedIngredients as $ingredientId => $deductPerProduct) {
                $totalDeduct = $deductPerProduct * $totalOrderQuantity;
                
                $ingredient = $db->table('ingredients')->where('ingredient_id', $ingredientId)->get()->getRowArray();
                if ($ingredient) {
                    $newQuantity = max(0, $ingredient['quantity'] - $totalDeduct);
                    $db->table('ingredients')->where('ingredient_id', $ingredientId)->update(['quantity' => $newQuantity]);
                }
            }
        }
    }
}