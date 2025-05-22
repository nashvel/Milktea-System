<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'product_id';

    protected $allowedFields = [
        'user_id', 'product_name', 'category', 'image', 'price', 'stock'
    ];


    protected $useTimestamps = false;
}
