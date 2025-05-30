<?php

namespace App\Models;

use CodeIgniter\Model;

class IngredientModel extends Model
{
    protected $table         = 'ingredients';
    protected $primaryKey    = 'ingredient_id';
    protected $useAutoIncrement = true;
    protected $returnType    = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['name', 'quantity', 'unit', 'description', 'created_at', 'updated_at'];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'name' => 'required|min_length[2]',
        'quantity' => 'required|integer|greater_than_equal_to[0]',
        'unit' => 'required|string',
    ];
    
    protected $validationMessages = [
        'name' => [
            'required' => 'Ingredient name is required',
            'min_length' => 'Ingredient name must be at least 2 characters long',
        ],
        'quantity' => [
            'required' => 'Quantity is required',
            'integer' => 'Quantity must be a whole number',
            'greater_than_equal_to' => 'Quantity cannot be negative',
        ],
        'unit' => [
            'required' => 'Unit of measurement is required',
        ],
    ];
    
    protected $skipValidation = false;

    /**
     * Get ingredients with low stock
     *
     * @param int $threshold The threshold below which stock is considered low
     * @return array The ingredients with low stock
     */
    public function getLowStock($threshold = 500)
    {
        return $this->where('quantity <', $threshold)->findAll();
    }
}
