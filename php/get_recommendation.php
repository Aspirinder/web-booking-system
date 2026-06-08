<?php

// Step 1: Securely load core database connection config handler
include_once 'db.php';

// Safe fallback parsing if URL query parameter context is missing
$cat = $_GET['category'] ?? 'Apartments';

try {
    // Step 2: Ingest data payload safely using Prepared Statements (Anti-SQLi guard)
    $stmt = $conn->prepare("SELECT * FROM offers WHERE category = ?");
    $stmt->bind_param("s", $cat);
    $stmt->execute();
    $result = $stmt->get_result();

    $offers = [];
    // Hydrate collection data payload array sequentially
    while ($row = $result->fetch_assoc()) {
        $offers[] = $row;
    }

    // Step 3: Stream specific category records package formatted as standard JSON
    header('Content-Type: application/json');
    echo json_encode($offers);

} catch (Exception $e) {
    // Structural fallback path to catch database transmission issues safely
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'DB error: ' . $e->getMessage()
    ]);
}
?>