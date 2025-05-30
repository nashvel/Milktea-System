<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;

class SalesController extends ResourceController
{
    use ResponseTrait;

    public function create()
    {
        // Get request body (JSON)
        $input = $this->request->getJSON(true);
        
        // Validate required fields
        if (!isset($input['product_id']) || !isset($input['payment_method']) || !isset($input['quantity'])) {
            return $this->failValidationErrors('Product ID, payment method, and quantity are required');
        }

        // Start a database transaction for data consistency
        $db = \Config\Database::connect();
        $db->transBegin();
        
        try {
            // Prepare data for insertion
            $data = [
                'product_id' => $input['product_id'],
                'payment_method' => $input['payment_method'],
                'quantity' => $input['quantity'],
                'cash_given' => $input['cash_given'] ?? null,
                'change_amount' => $input['change_amount'] ?? null,
            ];
            
            // Insert the sales record
            $builder = $db->table('sales');
            $builder->insert($data);
            $salesId = $db->insertID();
            
            if (!$salesId) {
                throw new \Exception('Failed to insert sales record');
            }
            
            // Calculate total order quantity from main order and transaction products
            $totalProductsOrdered = (int)$input['quantity']; // Main product quantity
            
            // If transaction data is provided, create a transaction
            $transactionId = null;
            if (isset($input['transaction'])) {
                $transactionBuilder = $db->table('transactions');
                $transactionData = [
                    'transaction_date' => date('Y-m-d H:i:s'),
                    'customer' => $input['transaction']['customer'] ?? null,
                    'total' => $input['transaction']['total'] ?? 0,
                    'sales_id' => $salesId
                ];
                $transactionBuilder->insert($transactionData);
                $transactionId = $db->insertID();
                
                if (!$transactionId) {
                    throw new \Exception('Failed to insert transaction record');
                }
                
                // Process additional products from transaction_products
                if (isset($input['transaction_products']) && is_array($input['transaction_products'])) {
                    $tpBuilder = $db->table('transaction_products');
                    
                    // Count additional products in transaction_products
                    foreach ($input['transaction_products'] as $tp) {
                        if (isset($tp['product_id']) && isset($tp['quantity'])) {
                            // Add this product's quantity to total
                            $totalProductsOrdered += (int)$tp['quantity'];
                            
                            // Also create the transaction_products record
                            $tpData = [
                                'transaction_id' => $transactionId,
                                'product_id' => $tp['product_id'],
                                'sales_id' => $salesId
                            ];
                            $tpBuilder->insert($tpData);
                        }
                    }
                }
            }
            
            // Now deduct ingredients based on total products ordered
            $this->deductIngredientsForOrder($totalProductsOrdered);
            
            // Commit the transaction if everything succeeds
            $db->transCommit();
            
            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Sale recorded successfully with ingredient deduction',
                'sales_id' => $salesId,
                'transaction_id' => $transactionId,
                'products_ordered' => $totalProductsOrdered
            ]);
            
        } catch (\Exception $e) {
            // Rollback the transaction if anything fails
            $db->transRollback();
            
            log_message('error', 'Error in sales creation: ' . $e->getMessage());
            return $this->failServerError('Failed to record sale: ' . $e->getMessage());
        }
    }
    
    /**
     * Deduct ingredients for ordered products
     * 
     * @param array $productIds Array of product IDs in the order
     * @param array $productQuantities Array of product quantities indexed by product_id
     * @return void
     */
    /**
     * Deduct ingredients for an order based on number of products ordered
     * 
     * @param int $totalProductsOrdered Total number of products in the order
     * @return void
     */
    private function deductIngredientsForOrder($totalProductsOrdered)
    {
        if ($totalProductsOrdered <= 0) {
            return;
        }
        
        $db = \Config\Database::connect();
        
        // Fixed deduction values as specified
        $ingredientDeductions = [
            26 => 4,   // ice cubes: 4 pieces per product
            27 => 2,   // oreo: 2 pieces per product
            28 => 40   // sugar daddy: 40 grams per product
        ];
        
        // Log what we're about to do
        log_message('info', "Deducting ingredients for {$totalProductsOrdered} products ordered");
        
        // Process each ingredient
        foreach ($ingredientDeductions as $ingredientId => $amountPerProduct) {
            // Calculate total deduction
            $totalDeduction = $amountPerProduct * $totalProductsOrdered;
            
            // Get current ingredient info
            $ingredient = $db->table('ingredients')
                ->where('ingredient_id', $ingredientId)
                ->get()
                ->getRowArray();
            
            if (!$ingredient) {
                log_message('error', "Ingredient ID {$ingredientId} not found in database");
                continue;
            }
            
            // Log current values
            $currentQuantity = $ingredient['quantity'];
            log_message('info', "Ingredient ID {$ingredientId} ({$ingredient['name']}): Current quantity: {$currentQuantity}, Deducting: {$totalDeduction}");
            
            // Calculate new quantity (never go below 0)
            $newQuantity = max(0, $currentQuantity - $totalDeduction);
            
            // Perform the update
            $result = $db->table('ingredients')
                ->where('ingredient_id', $ingredientId)
                ->update(['quantity' => $newQuantity]);
                
            if ($result) {
                log_message('info', "SUCCESS: Updated ingredient ID {$ingredientId} from {$currentQuantity} to {$newQuantity}");
            } else {
                log_message('error', "FAILED: Could not update ingredient ID {$ingredientId}");
            }
        }
    }
}