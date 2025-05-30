<?php

namespace App\Models;

use CodeIgniter\Model;

class RestockModel extends Model
{
    protected $table         = 'ingredient_restocks';
    protected $primaryKey    = 'restock_id';
    protected $useAutoIncrement = true;
    protected $returnType    = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['ingredient_id', 'quantity_added', 'restock_date', 'restocked_by', 'notes'];

    // Validation
    protected $validationRules = [
        'ingredient_id' => 'required|integer|is_not_unique[ingredients.ingredient_id]',
        'quantity_added' => 'required|integer|greater_than[0]',
        'restock_date' => 'required|valid_date',
        'restocked_by' => 'required|integer|is_not_unique[users.id]',
    ];
    
    protected $validationMessages = [
        'ingredient_id' => [
            'required' => 'Ingredient ID is required',
            'integer' => 'Ingredient ID must be a number',
            'is_not_unique' => 'Ingredient does not exist',
        ],
        'quantity_added' => [
            'required' => 'Quantity added is required',
            'integer' => 'Quantity added must be a whole number',
            'greater_than' => 'Quantity added must be greater than 0',
        ],
        'restock_date' => [
            'required' => 'Restock date is required',
            'valid_date' => 'Restock date must be a valid date',
        ],
        'restocked_by' => [
            'required' => 'User ID is required',
            'integer' => 'User ID must be a number',
            'is_not_unique' => 'User does not exist',
        ],
    ];
    
    protected $skipValidation = false;

    /**
     * Get restock history for an ingredient
     *
     * @param int $ingredientId The ingredient ID
     * @return array The restock history for the ingredient
     */
    public function getRestockHistory($ingredientId)
    {
        $builder = $this->db->table('ingredient_restocks r');
        $builder->select('r.*, u.name as user_name');
        $builder->join('users u', 'u.id = r.restocked_by');
        $builder->where('r.ingredient_id', $ingredientId);
        $builder->orderBy('r.restock_date', 'DESC');
        
        return $builder->get()->getResultArray();
    }
}
