<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;

class Ingredients extends ResourceController
{
    use ResponseTrait;

    protected $modelName = 'App\Models\IngredientModel';
    protected $format    = 'json';

    /**
     * Return an array of ingredients
     *
     * @return mixed
     */
    public function index()
    {
        $ingredients = $this->model->findAll();
        return $this->respond(['ingredients' => $ingredients]);
    }

    /**
     * Return the properties of an ingredient
     *
     * @return mixed
     */
    public function show($id = null)
    {
        $ingredient = $this->model->find($id);

        if (!$ingredient) {
            return $this->failNotFound('Ingredient not found with id ' . $id);
        }

        return $this->respond(['ingredient' => $ingredient]);
    }

    /**
     * Restock an ingredient and record the restocking operation
     *
     * @return mixed
     */
    public function restock($id = null)
    {
        $rules = [
            'quantity_added' => 'required|greater_than[0]|integer',
            'restocked_by' => 'required|integer|is_not_unique[users.id]',
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        // Get the ingredient
        $ingredient = $this->model->find($id);

        if (!$ingredient) {
            return $this->failNotFound('Ingredient not found with id ' . $id);
        }

        // Update ingredient quantity
        $quantityAdded = $this->request->getVar('quantity_added');
        $newQuantity = $ingredient['quantity'] + $quantityAdded;

        $this->model->update($id, ['quantity' => $newQuantity]);

        // Record restock operation
        $restockModel = model('RestockModel');
        $restockData = [
            'ingredient_id' => $id,
            'quantity_added' => $quantityAdded,
            'restock_date' => date('Y-m-d H:i:s'),
            'restocked_by' => $this->request->getVar('restocked_by'),
            'notes' => $this->request->getVar('notes') ?? null,
        ];

        $restockModel->insert($restockData);

        return $this->respondUpdated([
            'message' => 'Ingredient restocked successfully',
            'ingredient' => $this->model->find($id)
        ]);
    }

    /**
     * Update ingredient properties
     *
     * @return mixed
     */
    public function update($id = null)
    {
        $rules = [
            'name' => 'permit_empty|string|min_length[2]',
            'quantity' => 'permit_empty|integer|greater_than_equal_to[0]',
            'unit' => 'permit_empty|string',
            'description' => 'permit_empty|string',
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        // Check if ingredient exists
        $ingredient = $this->model->find($id);
        if (!$ingredient) {
            return $this->failNotFound('Ingredient not found with id ' . $id);
        }

        // Get data to update
        $data = [];
        if ($this->request->getVar('name') !== null) {
            $data['name'] = $this->request->getVar('name');
        }
        if ($this->request->getVar('quantity') !== null) {
            $data['quantity'] = $this->request->getVar('quantity');
        }
        if ($this->request->getVar('unit') !== null) {
            $data['unit'] = $this->request->getVar('unit');
        }
        if ($this->request->getVar('description') !== null) {
            $data['description'] = $this->request->getVar('description');
        }

        // Only update if there's data to update
        if (!empty($data)) {
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->model->update($id, $data);
            return $this->respondUpdated([
                'message' => 'Ingredient updated successfully',
                'ingredient' => $this->model->find($id)
            ]);
        }

        return $this->respond([
            'message' => 'No changes made to ingredient',
            'ingredient' => $ingredient
        ]);
    }

    /**
     * Create a new ingredient
     *
     * @return mixed
     */
    public function create()
    {
        $rules = [
            'name' => 'required|string|min_length[2]',
            'unit' => 'required|string',
            'quantity' => 'required|integer|greater_than_equal_to[0]',
            'created_by' => 'required|integer'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $data = [
            'name' => $this->request->getVar('name'),
            'description' => $this->request->getVar('description') ?? '',
            'unit' => $this->request->getVar('unit'),
            'quantity' => $this->request->getVar('quantity'),
            'created_by' => $this->request->getVar('created_by'),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $ingredientId = $this->model->insert($data);

        if (!$ingredientId) {
            return $this->fail('Failed to create ingredient');
        }

        $ingredient = $this->model->find($ingredientId);

        return $this->respondCreated([
            'message' => 'Ingredient created successfully',
            'ingredient' => $ingredient
        ]);
    }

    /**
     * Handle product ordering and ingredient quantity deduction
     *
     * @return mixed
     */
    public function deductForOrder()
    {        
        $rules = [
            'product_id' => 'required|integer|is_not_unique[products.product_id]',
            'quantity' => 'required|integer|greater_than[0]',
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $productId = $this->request->getVar('product_id');
        $orderQuantity = $this->request->getVar('quantity');

        // Get product ingredients
        $productIngredientsModel = model('ProductIngredientModel');
        $productIngredients = $productIngredientsModel->where('product_id', $productId)->findAll();

        if (empty($productIngredients)) {
            return $this->respond([
                'message' => 'No ingredients defined for this product',
                'status' => 'success'
            ]);
        }

        // Check if all ingredients have enough quantity
        $ingredientUpdates = [];
        $insufficientIngredients = [];

        foreach ($productIngredients as $pi) {
            $ingredient = $this->model->find($pi['ingredient_id']);
            $requiredQuantity = $pi['quantity_required'] * $orderQuantity;

            if ($ingredient['quantity'] < $requiredQuantity) {
                $insufficientIngredients[] = [
                    'id' => $ingredient['ingredient_id'],
                    'name' => $ingredient['name'],
                    'available' => $ingredient['quantity'],
                    'required' => $requiredQuantity
                ];
            } else {
                $ingredientUpdates[$pi['ingredient_id']] = $ingredient['quantity'] - $requiredQuantity;
            }
        }

        if (!empty($insufficientIngredients)) {
            return $this->fail([
                'message' => 'Insufficient ingredients for this order',
                'insufficient_ingredients' => $insufficientIngredients
            ]);
        }

        // Deduct ingredients
        foreach ($ingredientUpdates as $id => $newQuantity) {
            $this->model->update($id, ['quantity' => $newQuantity]);
        }

        return $this->respond([
            'message' => 'Ingredients deducted successfully',
            'status' => 'success'
        ]);
    }
}
