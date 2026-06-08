<?php
// Step 1: Securely load core database connection config handler
include_once 'db.php';

header('Content-Type: application/json; charset=utf-8');

// Step 2: Ingest and decode structural JSON payload parameters
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No registration data provided."]);
    exit;
}

$username = trim($data['reg_username']);
$fullname = trim($data['reg_fullname']);
$email = trim($data['reg_email']);

// Encrypt the user password asset via strong one-way cryptographic hashing
$password = password_hash($data['reg_password'], PASSWORD_BCRYPT);

try {
    // Step 3: Check for existing credential duplicates safely (Anti-SQLi guard)
    $checkSql = "SELECT user_id FROM users WHERE email = ? OR username = ?";
    $stmtCheck = $conn->prepare($checkSql);
    $stmtCheck->bind_param("ss", $email, $username);
    $stmtCheck->execute();
    $checkResult = $stmtCheck->get_result();

    if ($checkResult->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "User already exists or username is taken."]);
        $stmtCheck->close();
        exit;
    }
    $stmtCheck->close();

    // Step 4: Inject verified registration data model into database tables
    $insertSql = "INSERT INTO users (username, fullname, email, password_hash) VALUES (?, ?, ?, ?)";
    $stmtInsert = $conn->prepare($insertSql);
    $stmtInsert->bind_param("ssss", $username, $fullname, $email, $password);
    
    // Step 5: Verify operational success state matrices and return validation tokens
    if($stmtInsert->execute()){
        echo json_encode(['status' => 'success', 'message' => 'Registration complete!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database operation execution failure']);
    }
    $stmtInsert->close();

} catch (Exception $e) {
    // Structural fallback path to catch database transmission issues safely
    echo json_encode([
        'status' => 'error',
        'message' => 'Pipeline structural storage failure: ' . $e->getMessage()
    ]);
}
?>