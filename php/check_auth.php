<?php
// Step 1: Initialize or resume the secure state tracking session
session_start();

header('Content-Type: application/json');

// Step 2: Validate the existence of an active authorization token
if (isset($_SESSION['user_id'])) {
    // Return validation metadata if user is securely logged in
    echo json_encode([
        "isLoggedIn" => true,
        "userId" => $_SESSION['user_id']
    ]);
} else {
    // Return fallback layout state for unauthorized guest sessions
    echo json_encode([
        "isLoggedIn" => false
    ]);
}
?>