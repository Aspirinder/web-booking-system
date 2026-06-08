<?php

// Step 1: Securely load core database connection config handler
include_once 'db.php';

// Step 2: Fetch unique reference metadata rows from storage
$sql = "SELECT DISTINCT * FROM benefits";
$result = $conn->query($sql);

$benefits = [];
// Hydrate collection data payload array sequentially
while ($row = $result->fetch_assoc()) {
    $benefits[] = $row;
}

// Step 3: Stream payload dataset formatted as standard JSON package
header('Content-Type: application/json');
echo json_encode($benefits);

?>