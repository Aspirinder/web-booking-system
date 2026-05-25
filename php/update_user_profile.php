<?php
include 'db.php';

include 'db.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

if(!isset($_SESSION['user_id'])){
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access.'
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

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

if ($fieldName === 'email' && !filter_var($fieldValue, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Please enter a valid email address.'
    ]);
    exit;
}

try {
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

    $updateSql = "UPDATE users SET {$dbColumn} = ? WHERE user_id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("si", $fieldValue, $userId);
    $updateStmt->execute();

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
    echo json_encode([
        'status' => 'error',
        'message' => 'DB error: ' . $e->getMessage()
    ]);
}
?>