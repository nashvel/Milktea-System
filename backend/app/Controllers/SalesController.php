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

        // Prepare data for insertion
        $data = [
            'product_id' => $input['product_id'],
            'payment_method' => $input['payment_method'],
            'quantity' => $input['quantity'],
            'cash_given' => $input['cash_given'] ?? null,
            'change_amount' => $input['change_amount'] ?? null,
        ];
        
        // Connect to the database
        $db = \Config\Database::connect();
        $builder = $db->table('sales');
        
        // Insert the sales record
        if ($builder->insert($data)) {
            $salesId = $db->insertID();
            
            // If transaction data is provided, create a transaction
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
                
                // If transaction products are provided, create transaction_products entries
                if (isset($input['transaction_products']) && is_array($input['transaction_products'])) {
                    $tpBuilder = $db->table('transaction_products');
                    foreach ($input['transaction_products'] as $tp) {
                        if (isset($tp['product_id'])) {
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
            
            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Sale recorded successfully',
                'sales_id' => $salesId
            ]);
        } else {
            return $this->failServerError('Failed to record sale');
        }
    }
} 