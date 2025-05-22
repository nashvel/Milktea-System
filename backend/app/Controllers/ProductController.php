<?php

namespace App\Controllers;

use App\Models\ProductModel;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use CodeIgniter\API\ResponseTrait;

class ProductController extends ResourceController
{
    use ResponseTrait;

    protected $productModel;

    public function __construct()
    {
        $this->productModel = new ProductModel();
    }

    public function index()
    {
        try {
            // Log that we're starting the request
            log_message('debug', 'ProductController::index() method called');
            
            // Check if the model is initialized correctly
            if (!$this->productModel) {
                log_message('error', 'ProductModel is not initialized');
                return $this->response->setJSON(['error' => 'Internal server error'])->setStatusCode(500);
            }
            
            // Try to get the products without any join
            $products = $this->productModel->findAll();
            log_message('debug', 'Found ' . count($products) . ' products');

            // Simplify the response for testing - just return raw data first
            return $this->response->setJSON(['success' => true, 'products' => $products]);
            
            // Original image processing code - commented out for testing
            /*
            $products = array_map(function ($product) {
                $product['image'] = $product['image']
                    ? base_url('images/product/' . $product['image'])
                    : null;
                return $product;    
            }, $products);

            return $this->response->setJSON($products);
            */
        } catch (\Exception $e) {
            // Log the error with full details
            log_message('error', 'Exception in ProductController::index(): ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            
            // Return a helpful error response
            return $this->response
                ->setJSON([
                    'error' => 'Internal server error',
                    'message' => $e->getMessage(),
                    'code' => $e->getCode()
                ])
                ->setStatusCode(500);
        }
    }

    public function create()
    {
        $validation = \Config\Services::validation();
        $rules = [
            'product_name' => 'required',
            'category' => 'required',
            'price' => 'required|decimal',
            'stock' => 'required|integer',
            'description' => 'required',
            'size' => 'permit_empty',
            'sugar_level' => 'permit_empty',
            'toppings' => 'permit_empty',
            'ingredients' => 'permit_empty',
            'user_id' => 'required|integer',
            'image' => 'uploaded[image]|is_image[image]|max_size[image,2048]',
        ];

        if (!$this->validate($rules)) {
            return $this->fail($validation->getErrors());
        }

        $image = $this->request->getFile('image');
        $imageName = null;
        if ($image && $image->isValid()) {
            $imageName = $image->getRandomName();
            $image->move(ROOTPATH . 'public/images/product/', $imageName);
        }

        $data = [
            'product_name' => $this->request->getPost('product_name'),
            'category' => $this->request->getPost('category'),
            'ingredients' => $this->request->getPost('ingredients'),
            'price' => $this->request->getPost('price'),
            'stock' => $this->request->getPost('stock'),
            'description' => $this->request->getPost('description'),
            'size' => $this->request->getPost('size'),
            'sugar_level' => $this->request->getPost('sugar_level'),
            'toppings' => $this->request->getPost('toppings'),
            'user_id' => $this->request->getPost('user_id'),
            'image' => $imageName,
        ];

        $db = \Config\Database::connect();
        $builder = $db->table('products');
        $builder->insert($data);

        return $this->respondCreated(['message' => 'Product created successfully']);
    }

    public function updateStock($id = null)
    {
        $input = $this->request->getJSON(true);
        if (!isset($input['stock']) || !is_numeric($input['stock'])) {
            return $this->failValidationErrors(['stock' => 'Stock is required and must be a number.']);
        }
        $stock = (int)$input['stock'];
        $product = $this->productModel->find($id);
        if (!$product) {
            return $this->failNotFound('Product not found');
        }
        $this->productModel->update($id, ['stock' => $stock]);
        return $this->respond(['message' => 'Stock updated successfully']);
    }

    public function delete($id = null)
    {
        if (!$id) {
            return $this->failValidationErrors(['id' => 'Product ID is required.']);
        }
        $product = $this->productModel->find($id);
        if (!$product) {
            return $this->failNotFound('Product not found');
        }
        $this->productModel->delete($id);
        return $this->respondDeleted(['message' => 'Product deleted successfully']);
    }

    public function updatePrice($id = null)
    {
        $input = $this->request->getJSON(true);
        if (!isset($input['price']) || !is_numeric($input['price']) || $input['price'] < 0) {
            return $this->failValidationErrors(['price' => 'Price is required and must be a positive number.']);
        }
        $price = (float)$input['price'];
        $product = $this->productModel->find($id);
        if (!$product) {
            return $this->failNotFound('Product not found');
        }
        $this->productModel->update($id, ['price' => $price]);
        return $this->respond(['message' => 'Product price updated successfully']);
    }

    public function updateName($id = null)
    {
        $input = $this->request->getJSON(true);
        if (!isset($input['product_name']) || !is_string($input['product_name']) || trim($input['product_name']) === '') {
            return $this->failValidationErrors(['product_name' => 'Product name is required and must be a non-empty string.']);
        }
        $name = trim($input['product_name']);
        $product = $this->productModel->find($id);
        if (!$product) {
            return $this->failNotFound('Product not found');
        }
        if ($product['product_name'] === $name) {
            return $this->respond(['message' => 'No changes made.']);
        }
        // Use query builder to force update
        $db = \Config\Database::connect();
        $builder = $db->table('products');
        $builder->where('product_id', $id)->update(['product_name' => $name]);
        return $this->respond(['message' => 'Product name updated successfully']);
    }

    public function updateCategory($id = null)
    {
        $input = $this->request->getJSON(true);
        $allowed = ['milktea', 'smoothie', 'iced tea'];
        if (!isset($input['category']) || !in_array($input['category'], $allowed)) {
            return $this->failValidationErrors(['category' => 'Category is required and must be one of: milktea, smoothie, iced tea.']);
        }
        $category = $input['category'];
        $product = $this->productModel->find($id);
        if (!$product) {
            return $this->failNotFound('Product not found');
        }
        if ($product['category'] === $category) {
            return $this->respond(['message' => 'No changes made.']);
        }
        $db = \Config\Database::connect();
        $builder = $db->table('products');
        $builder->where('product_id', $id)->update(['category' => $category]);
        return $this->respond(['message' => 'Product category updated successfully']);
    }
}
