<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class IngredientsSeeder extends Seeder
{
    public function run()
    {
        $data = [
            // Base ingredients
            [
                'name' => 'Black Tea Leaves',
                'quantity' => 5000,
                'unit' => 'grams',
                'description' => 'Premium black tea leaves for milktea base',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Green Tea Leaves',
                'quantity' => 5000,
                'unit' => 'grams',
                'description' => 'High-quality green tea leaves',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Oolong Tea Leaves',
                'quantity' => 3000,
                'unit' => 'grams',
                'description' => 'Traditional oolong tea leaves',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Jasmine Tea Leaves',
                'quantity' => 3000,
                'unit' => 'grams',
                'description' => 'Fragrant jasmine tea leaves',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            
            // Milk components
            [
                'name' => 'Fresh Milk',
                'quantity' => 10000,
                'unit' => 'ml',
                'description' => 'Fresh dairy milk',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Non-dairy Creamer',
                'quantity' => 5000,
                'unit' => 'grams',
                'description' => 'Non-dairy creamer powder',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Condensed Milk',
                'quantity' => 5000,
                'unit' => 'ml',
                'description' => 'Sweetened condensed milk',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Coconut Milk',
                'quantity' => 5000,
                'unit' => 'ml',
                'description' => 'Plant-based coconut milk alternative',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            
            // Pearls and toppings
            [
                'name' => 'Tapioca Pearls',
                'quantity' => 10000,
                'unit' => 'grams',
                'description' => 'Classic black tapioca pearls (boba)',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Crystal Pearls',
                'quantity' => 5000,
                'unit' => 'grams',
                'description' => 'Translucent tapioca pearls',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Grass Jelly',
                'quantity' => 5000,
                'unit' => 'grams',
                'description' => 'Herbal jelly cubes',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Pudding',
                'quantity' => 5000,
                'unit' => 'grams',
                'description' => 'Egg pudding cubes',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Nata de Coco',
                'quantity' => 5000,
                'unit' => 'grams',
                'description' => 'Coconut gel cubes',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Red Bean',
                'quantity' => 5000,
                'unit' => 'grams',
                'description' => 'Sweetened red beans',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            
            // Flavor syrups
            [
                'name' => 'Brown Sugar Syrup',
                'quantity' => 5000,
                'unit' => 'ml',
                'description' => 'Caramelized brown sugar syrup',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Vanilla Syrup',
                'quantity' => 3000,
                'unit' => 'ml',
                'description' => 'Vanilla flavored syrup',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Caramel Syrup',
                'quantity' => 3000,
                'unit' => 'ml',
                'description' => 'Rich caramel flavored syrup',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Taro Powder',
                'quantity' => 2000,
                'unit' => 'grams',
                'description' => 'Purple taro flavored powder',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Matcha Powder',
                'quantity' => 2000,
                'unit' => 'grams',
                'description' => 'Premium Japanese matcha powder',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Chocolate Powder',
                'quantity' => 3000,
                'unit' => 'grams',
                'description' => 'Rich chocolate powder',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            
            // Fruit ingredients
            [
                'name' => 'Fresh Strawberries',
                'quantity' => 2000,
                'unit' => 'grams',
                'description' => 'Fresh strawberries for fruit teas',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Mango Chunks',
                'quantity' => 2000,
                'unit' => 'grams',
                'description' => 'Fresh mango pieces',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Lychee Syrup',
                'quantity' => 2000,
                'unit' => 'ml',
                'description' => 'Sweet lychee flavored syrup',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Passion Fruit Syrup',
                'quantity' => 2000,
                'unit' => 'ml',
                'description' => 'Tangy passion fruit flavored syrup',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            
            // Additives
            [
                'name' => 'Granulated Sugar',
                'quantity' => 10000,
                'unit' => 'grams',
                'description' => 'Regular white sugar',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Ice Cubes',
                'quantity' => 50000,
                'unit' => 'grams',
                'description' => 'Frozen water cubes',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];
        
        // Insert data to the ingredients table
        $this->db->table('ingredients')->insertBatch($data);
        
        echo "Ingredient data seeded successfully!\n";
    }
}
