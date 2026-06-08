<?php
// Step 1: Initialize safe server-side session tracking pipelines
session_start();

header('Content-Type: application/json; charset=utf-8');

// Step 2: Ingest and decode structural JSON payload parameters
include_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = isset($data['log_email']) ? trim($data['log_email']) : '';
$password = isset($data['log_password']) ? $data['log_password'] : '';

try {
    // Step 3: Fetch targeted user record securely (Anti-SQLi guard)
    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Step 4: Verify cryptographic password hash match conditions
        if(password_verify($password, $user["password_hash"])) {

            // Bind session identity state anchor variables keys
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['email'] = $user['email'];
        
            echo json_encode([
                "status"=> "success",
                "message"=> "Welcome back, " . $user['fullname'],
                "user" => [
                    "id" => $user["user_id"],
                    "name" => $user["fullname"]
                ]
            ]);
        } else {
            // Generic security response layout for invalid matching inputs
            echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    }

} catch (Exception $e) {
    // Structural fallback path to catch database transmission issues safely
    echo json_encode([
        "status" => "error",
        "message" => "Authentication pipeline failure: " . $e->getMessage()
    ]);
}
?>