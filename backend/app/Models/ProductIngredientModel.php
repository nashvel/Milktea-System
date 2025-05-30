<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductIngredientModel extends Model
{
    protected $table         = 'product_ingredients';
    protected $primaryKey    = 'id';
    protected $useAutoIncrement = true;
    protected $returnType    = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['product_id', 'ingredient_id', 'quantity_required'];

    // Validation
    protected $validationRules = [
        'product_id' => 'required|integer|is_not_unique[products.product_id]',
        'ingredient_id' => 'required|integer|is_not_unique[ingredients.ingredient_id]',
        'quantity_required' => 'required|integer|greater_than[0]',
    ];
    
    protected $validationMessages = [
        'product_id' => [
            'required' => 'Product ID is required',
            'integer' => 'Product ID must be a number',
            'is_not_unique' => 'Product does not exist',
        ],
        'ingredient_id' => [
            'required' => 'Ingredient ID is required',
            'integer' => 'Ingredient ID must be a number',
            'is_not_unique' => 'Ingredient does not exist',
        ],
        'quantity_required' => [
            'required' => 'Quantity required is required',
            'integer' => 'Quantity required must be a whole number',
            'greater_than' => 'Quantity required must be greater than 0',
        ],
    ];
    
    protected $skipValidation = false;

    /**
     * Get all ingredients for a product
     *
     * @param int $productId The product ID
     * @return array The ingredients for the product with their details
     */
    public function getProductIngredients($productId)
    {
        $builder = $this->db->table('product_ingredients pi');
        $builder->select('pi.*, i.name, i.unit, i.quantity as available_quantity');
        $builder->join('ingredients i', 'i.ingredient_id = pi.ingredient_id');
        $builder->where('pi.product_id', $productId);
        
        return $builder->get()->getResultArray();
    }
}
