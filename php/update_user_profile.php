<?php

// Step 1: Securely load core database connection config handler
include 'db.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

// Security Guard: Authenticate active session
if(!isset($_SESSION['user_id'])){
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access.'
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

// Payload Validation: Parse and verify raw JSON input stream
$inputData = file_get_contents('php://input');
$data = json_decode($inputData, true);

if (empty($data['field']) || !isset($data['value'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request parameters.'
    ]);
    exit;
}

$fieldName = trim($data['field']);
$fieldValue = trim($data['value']);

// Security Guard: Explicit structural whitelist mapping for column updates
$allowedFields = [
    'username' => 'username',
    'fullname' => 'fullname',
    'email'    => 'email'
];

if (!array_key_exists($fieldName, $allowedFields)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'This field is restricted from modifications.'
    ]);
    exit;
}

$dbColumn = $allowedFields[$fieldName];

// Validate semantic correctness if processing email updates paths
if ($fieldName === 'email' && !filter_var($fieldValue, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Please enter a valid email address.'
    ]);
    exit;
}

try {
    // Step 2: Check for credential duplicates cross-referencing other user records
    if ($fieldName === 'username' || $fieldName === 'email') {
        $uniqueSql = "SELECT user_id FROM users WHERE {$dbColumn} = ? AND user_id != ?";
        $uniqueStmt = $conn->prepare($uniqueSql);
        $uniqueStmt->bind_param("si", $fieldValue, $userId);
        $uniqueStmt->execute();
        $uniqueResult = $uniqueStmt->get_result();
        
        if ($uniqueResult->num_rows > 0) {
            echo json_encode([
                'status' => 'error',
                'message' => "This " . $fieldName . " is already taken by another user."
            ]);
            exit;
        }
    }

    // Step 3: Execute target status record modification via dynamic variables queries
    $updateSql = "UPDATE users SET {$dbColumn} = ? WHERE user_id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("si", $fieldValue, $userId);

    if ($updateStmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Profile updated successfully.'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to execute database update.'
        ]);
    }

} catch (Exception $e) {
    // Structural fallback path to catch database transmission issues safely
    echo json_encode([
        'status' => 'error',
        'message' => 'DB error: ' . $e->getMessage()
    ]);
}
?>