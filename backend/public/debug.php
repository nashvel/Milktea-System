<?php

// Display all PHP errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Debug Information</h1>";

// Check PHP Version
echo "<h2>PHP Version</h2>";
echo "<p>" . phpversion() . "</p>";

// Check if CodeIgniter is loaded
echo "<h2>CodeIgniter Status</h2>";
if (defined('BASEPATH')) {
    echo "<p>CodeIgniter is loaded.</p>";
} else {
    echo "<p>CodeIgniter is not loaded.</p>";
}

// Load environment variables
$dotenv = file_exists('../.env') ? file_get_contents('../.env') : "No .env file found";
echo "<h2>Environment File</h2>";
echo "<pre>" . htmlspecialchars($dotenv) . "</pre>";

// Check Database Connection
echo "<h2>Database Connection</h2>";
try {
    $db = new PDO(
        "mysql:host=localhost;dbname=storeinventory",
        "root",
        ""
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color:green'>Database connection successful!</p>";
    
    // Check tables
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "<h3>Tables in Database:</h3>";
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>" . htmlspecialchars($table) . "</li>";
    }
    echo "</ul>";
    
} catch(PDOException $e) {
    echo "<p style='color:red'>Database connection failed: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// Check important directories
$directoriesToCheck = [
    '../writable' => null,
    '../writable/logs' => null,
    '../writable/cache' => null,
    '../writable/session' => null,
    '../public/images/product' => null,
];

echo "<h2>Directory Permissions</h2>";
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Directory</th><th>Exists</th><th>Writable</th></tr>";

foreach ($directoriesToCheck as $dir => $value) {
    $exists = file_exists($dir);
    $writable = $exists ? is_writable($dir) : false;
    echo "<tr>";
    echo "<td>" . htmlspecialchars($dir) . "</td>";
    echo "<td style='color:" . ($exists ? "green" : "red") . "'>" . ($exists ? "Yes" : "No") . "</td>";
    echo "<td style='color:" . ($writable ? "green" : "red") . "'>" . ($writable ? "Yes" : "No") . "</td>";
    echo "</tr>";
}
echo "</table>";

// Check logs
echo "<h2>Log Files</h2>";
$logDir = "../writable/logs";
if (file_exists($logDir)) {
    $logFiles = glob($logDir . "/*.log");
    if (!empty($logFiles)) {
        foreach ($logFiles as $logFile) {
            echo "<h3>" . htmlspecialchars(basename($logFile)) . "</h3>";
            echo "<pre style='max-height: 300px; overflow: auto; background-color: #f8f9fa; padding: 10px;'>";
            echo htmlspecialchars(file_get_contents($logFile));
            echo "</pre>";
        }
    } else {
        echo "<p>No log files found in " . htmlspecialchars($logDir) . "</p>";
    }
} else {
    echo "<p>Log directory does not exist: " . htmlspecialchars($logDir) . "</p>";
}

// Try to load the ProductController class
echo "<h2>ProductController Status</h2>";
if (file_exists('../app/Controllers/ProductController.php')) {
    echo "<p>ProductController file exists.</p>";
    
    // Check if we can include it directly (though this might not work without CI's autoloading)
    echo "<pre>";
    echo htmlspecialchars(file_get_contents('../app/Controllers/ProductController.php'));
    echo "</pre>";
} else {
    echo "<p>ProductController file does not exist.</p>";
}

// Function to get MySQL error log
function getMySQLErrorLog() {
    try {
        $db = new PDO("mysql:host=localhost;dbname=storeinventory", "root", "");
        $result = $db->query("SHOW VARIABLES LIKE 'log_error'")->fetch(PDO::FETCH_ASSOC);
        
        if ($result && isset($result['Value'])) {
            $logFile = $result['Value'];
            
            if (file_exists($logFile) && is_readable($logFile)) {
                return file_get_contents($logFile);
            } else {
                return "MySQL error log exists at {$logFile} but is not readable.";
            }
        } else {
            return "Could not determine MySQL error log path.";
        }
    } catch (PDOException $e) {
        return "Failed to query MySQL error log: " . $e->getMessage();
    }
}

// Display MySQL error log
echo "<h2>MySQL Error Log</h2>";
echo "<pre>";
echo htmlspecialchars(getMySQLErrorLog());
echo "</pre>";

echo "<p>Debug information generated at: " . date('Y-m-d H:i:s') . "</p>"; 