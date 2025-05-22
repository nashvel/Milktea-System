<?php

// Display all PHP errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Products Table Check</h1>";

// Database connection parameters
$hostname = 'localhost';
$username = 'root';
$password = '';
$database = 'storeinventory';

try {
    // Connect to MySQL
    $db = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color:green'>Database connection successful!</p>";

    // Check if products table exists
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "<h2>Tables in database:</h2>";
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>" . htmlspecialchars($table) . "</li>";
    }
    echo "</ul>";

    // Find products table (it might be named differently)
    $productsTable = null;
    foreach ($tables as $table) {
        if (strpos(strtolower($table), 'product') !== false) {
            $productsTable = $table;
            break;
        }
    }

    if ($productsTable) {
        echo "<h2>Found products table: " . htmlspecialchars($productsTable) . "</h2>";
        
        // Get table structure
        echo "<h3>Table Structure:</h3>";
        $columns = $db->query("DESCRIBE $productsTable")->fetchAll(PDO::FETCH_ASSOC);
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        foreach ($columns as $column) {
            echo "<tr>";
            foreach ($column as $key => $value) {
                echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
        
        // Get data
        echo "<h3>Table Data:</h3>";
        $data = $db->query("SELECT * FROM $productsTable LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($data)) {
            echo "<table border='1' cellpadding='5'>";
            echo "<tr>";
            foreach (array_keys($data[0]) as $header) {
                echo "<th>" . htmlspecialchars($header) . "</th>";
            }
            echo "</tr>";
            
            foreach ($data as $row) {
                echo "<tr>";
                foreach ($row as $value) {
                    echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
                }
                echo "</tr>";
            }
            echo "</table>";
            echo "<p>Showing first " . count($data) . " records</p>";
        } else {
            echo "<p>No data found in table</p>";
            
            // Check if class name vs table name mismatch is causing issue
            echo "<h3>CodeIgniter Model Class Check</h3>";
            echo "<p>Migration creates table name: <strong>$productsTable</strong></p>";
            echo "<p>ProductModel uses table name: <strong>products</strong></p>";
            if ($productsTable !== 'products') {
                echo "<p style='color:red'>ISSUE DETECTED: Table name mismatch between migration and model!</p>";
            }
        }
    } else {
        echo "<h2 style='color:red'>No products table found!</h2>";
        echo "<p>Try running the migrations:</p>";
        echo "<pre>php spark migrate</pre>";
    }

    // Check for table creation error in logs
    echo "<h3>Foreign Key Check</h3>";
    $foreignKeyCheck = $db->query("SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                                 FROM information_schema.KEY_COLUMN_USAGE 
                                 WHERE REFERENCED_TABLE_SCHEMA = '$database'")->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($foreignKeyCheck)) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>Constraint</th><th>Table</th><th>Column</th><th>Referenced Table</th><th>Referenced Column</th></tr>";
        foreach ($foreignKeyCheck as $fk) {
            echo "<tr>";
            foreach ($fk as $value) {
                echo "<td>" . htmlspecialchars($value) . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No foreign keys found</p>";
    }
    
} catch (PDOException $e) {
    echo "<h2 style='color:red'>Database Error</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
} 