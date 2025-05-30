<?php
// This is a test script to manually deduct ingredients

// Simulate the same environment as in the controller
require_once 'app/Config/Paths.php';
require_once 'vendor/codeigniter4/framework/system/bootstrap.php';

// Connect to database
$db = \Config\Database::connect();

// Show current ingredient quantities before deduction
echo "CURRENT INGREDIENT QUANTITIES BEFORE DEDUCTION:\n";
$ingredients = $db->table('ingredients')
    ->whereIn('ingredient_id', [26, 27, 28])
    ->get()
    ->getResultArray();

foreach ($ingredients as $ingredient) {
    echo "ID: {$ingredient['ingredient_id']}, Name: {$ingredient['name']}, Quantity: {$ingredient['quantity']}\n";
}

// Simulate product order - deduct ingredients
$hardcodedIngredients = [
    26 => 4,   // ice cubes: 4 pieces per product
    27 => 2,   // oreo: 2 pieces per product
    28 => 40   // sugar daddy: 40 grams per product
];

// Simulate ordering 1 product
$orderQuantity = 1;

echo "\nDEDUCTING FOR {$orderQuantity} PRODUCTS:\n";

foreach ($hardcodedIngredients as $ingredientId => $deductPerProduct) {
    $totalDeduct = $deductPerProduct * $orderQuantity;
    
    // Get current quantity
    $ingredient = $db->table('ingredients')
        ->where('ingredient_id', $ingredientId)
        ->get()
        ->getRowArray();
    
    if ($ingredient) {
        $currentQuantity = $ingredient['quantity'];
        echo "Ingredient ID {$ingredientId}: Current quantity: {$currentQuantity}, Deducting: {$totalDeduct}\n";
        
        // Calculate new quantity
        $newQuantity = max(0, $currentQuantity - $totalDeduct);
        
        // Update the ingredient quantity
        $updateResult = $db->table('ingredients')
            ->where('ingredient_id', $ingredientId)
            ->update(['quantity' => $newQuantity]);
        
        if ($updateResult) {
            echo "SUCCESS: Updated ingredient ID {$ingredientId} to quantity: {$newQuantity}\n";
        } else {
            echo "ERROR: Failed to update ingredient ID {$ingredientId}\n";
        }
    } else {
        echo "ERROR: Ingredient with ID {$ingredientId} not found\n";
    }
}

// Show updated quantities
echo "\nUPDATED INGREDIENT QUANTITIES AFTER DEDUCTION:\n";
$updatedIngredients = $db->table('ingredients')
    ->whereIn('ingredient_id', [26, 27, 28])
    ->get()
    ->getResultArray();

foreach ($updatedIngredients as $ingredient) {
    echo "ID: {$ingredient['ingredient_id']}, Name: {$ingredient['name']}, Quantity: {$ingredient['quantity']}\n";
}

echo "\nDone!\n";
