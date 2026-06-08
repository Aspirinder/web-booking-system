<?php

// Step 1: Securely load core database connection config handler
include_once 'db.php';

// Safe layout fallback translation check for search query string
$query = isset($_GET['q']) ? $_GET['q'] : '';

// Step 2: Enforce character length validation constraints
if(strlen($query) >= 3){
    // Query dynamic matching pairs using safe SQL pattern wildcards
    $stmt = $conn->prepare("SELECT DISTINCT city, country FROM offers WHERE city LIKE ? OR country LIKE ? LIMIT 5");
    $searchTerm = "%$query%";
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $locations = [];

    // Step 3: Hydrate custom search predictions layout payload array
    while($row = $result->fetch_assoc()){
        $locations[] = [
            'display' => $row['city'] . ", " . $row["country"],
            'city' => $row['city']
        ];
    }

    // Stream prediction dataset formatted as standard JSON package
    echo json_encode($locations);
}

?>