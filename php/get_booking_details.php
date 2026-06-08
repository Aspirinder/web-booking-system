<?php

include 'db.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

// Security Guard: Authenticate active session
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access. Please log in.'
    ]);
    exit;
}

// Payload Validation: Verify URL query parameters
if (empty($_GET['id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing booking ID parameter.'
    ]);
    exit;
}

// Force secure data typing context
$bookingId = intval($_GET['id']);

try {
    // Step 1: Query database using relational JOINS to extract unified details
    $sql = "SELECT b.*, o.name AS offer_name, u.fullname AS host_name FROM bookings b
        JOIN offers o ON b.offer_id = o.offer_id
        JOIN users u ON o.user_id = u.user_id
        WHERE b.booking_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $bookingId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    // Step 2: Validate dataset record existence and send dynamic JSON packet
    if($result){
        echo json_encode([
            'status' => 'success',
            'booking' => $result
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Booking not found or you do not have permission to view it.'
        ]);
    }

} catch(Exception $e) {
    // Structural fallback path to catch database transmission issues safely
    echo json_encode([
        'status' => 'error',
        'message' => 'DB error: ' . $e->getMessage()
    ]);
}
?>