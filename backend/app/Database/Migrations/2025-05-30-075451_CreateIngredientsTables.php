<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateIngredientsTables extends Migration
{
    public function up()
    {
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
    }

    public function down()
    {
        // Drop tables in reverse order to avoid foreign key constraints
        $this->forge->dropTable('ingredient_restocks', true);
        $this->forge->dropTable('product_ingredients', true);
        $this->forge->dropTable('ingredients', true);
    }
}
