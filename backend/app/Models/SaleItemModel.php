<?php

namespace App\Models;

use CodeIgniter\Model;

class SaleItemModel extends Model
{
    protected $table = 'sale_items';
    protected $primaryKey = 'sale_item_id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = ['sale_id', 'product_id', 'quantity', 'unit_price', 'subtotal'];

    // Get items for a specific sale
    public function getSaleItems($saleId)
    {
        return $this->where('sale_id', $saleId)
                    ->findAll();
    }

    // Get sales details with product information
    public function getSaleItemsWithProducts($saleId)
    {
        return $this->select('sale_items.*, products.name as product_name, products.category')
                    ->join('products', 'products.product_id = sale_items.product_id')
                    ->where('sale_items.sale_id', $saleId)
                    ->findAll();
    }
} 