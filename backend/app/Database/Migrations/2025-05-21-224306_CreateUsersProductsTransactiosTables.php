<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsersProductsTransactionsTables extends Migration
{
    public function up()
    {
        // Users Table
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'email' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
                'unique' => true,
            ],
            'password' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
            ],
            'name' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('users');

        // Ingredients Table
        $this->forge->addField([
            'ingredient_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'name' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
            ],
            'quantity' => [
                'type' => 'INT',
                'unsigned' => true,
                'default' => 0,
            ],
            'unit' => [
                'type' => 'VARCHAR',
                'constraint' => '50',
                'default' => 'grams',
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('ingredient_id', true);
        $this->forge->createTable('ingredients');

        // Products Table
        $this->forge->addField([
            'product_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'user_id' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'product_name' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
            ],
            'image' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
                'null' => true,
            ],
            'category' => [
                'type' => 'ENUM',
                'constraint' => ['milktea', 'smoothie', 'iced tea'],
            ],
            'ingredients' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'price' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
            ],
            'stock' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'size' => [
                'type' => 'VARCHAR',
                'constraint' => '100',
                'null' => true,
            ],
            'sugar_level' => [
                'type' => 'VARCHAR',
                'constraint' => '100',
                'null' => true,
            ],
            'toppings' => [
                'type' => 'TEXT',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('product_id', true);
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('products');

        // Product Ingredients Junction Table
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'product_id' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'ingredient_id' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'quantity_required' => [
                'type' => 'INT',
                'unsigned' => true,
                'default' => 1,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('product_id', 'products', 'product_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('ingredient_id', 'ingredients', 'ingredient_id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('product_ingredients');

        // Ingredient Restocking Table
        $this->forge->addField([
            'restock_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'ingredient_id' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'quantity_added' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'restock_date' => [
                'type' => 'DATETIME',
            ],
            'restocked_by' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'notes' => [
                'type' => 'TEXT',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('restock_id', true);
        $this->forge->addForeignKey('ingredient_id', 'ingredients', 'ingredient_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('restocked_by', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('ingredient_restocks');

        // Sales Table
        $this->forge->addField([
            'sales_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'product_id' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'payment_method' => [
                'type' => 'VARCHAR',
                'constraint' => '50',
            ],
            'quantity' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'cash_given' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
                'null' => true,
            ],
            'change_amount' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('sales_id', true);
        $this->forge->addForeignKey('product_id', 'products', 'product_id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('sales');

        // Transactions Table
        $this->forge->addField([
            'transaction_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'transaction_date' => [
                'type' => 'DATETIME',
            ],
            'customer' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
                'null' => true,
            ],
            'total' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
            ],
            'sales_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
            ],
        ]);
        $this->forge->addKey('transaction_id', true);
        $this->forge->addForeignKey('sales_id', 'sales', 'sales_id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('transactions');

        // Transaction_Products Conjunction Table (Many-to-Many)
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'transaction_id' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'product_id' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'sales_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('transaction_id', 'transactions', 'transaction_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('product_id', 'products', 'product_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('sales_id', 'sales', 'sales_id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('transaction_products');
    }

    public function down()
    {
        $this->forge->dropTable('transaction_products', true);
        $this->forge->dropTable('transactions', true);
        $this->forge->dropTable('sales', true);
        $this->forge->dropTable('products', true);
        $this->forge->dropTable('users', true);
    }
} 