<?php

include 'db.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

// Security Guard: Authenticate active session
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access. Please log in again.'
    ]);
    exit;
}

// Payload Validation: Parse and verify raw JSON input stream
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['booking_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing booking ID.'
    ]);
    exit;
}

// Force secure data typing context
$userId = intval($_SESSION['user_id']);
$bookingId = intval($data['booking_id']);

try {
    // Step 1: Query permissions and verify record existence
    $checkSql = "SELECT status FROM bookings WHERE booking_id = ? AND user_id = ?";
    $stmtCheck = $conn->prepare($checkSql);
    $stmtCheck->bind_param("ii", $bookingId, $userId);
    $stmtCheck->execute();
    $resCheck = $stmtCheck->get_result()->fetch_assoc();

    // Prevent cross-user data manipulation or unauthorized entry attempts
    if (!$resCheck) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Booking not found or you do not have permission to cancel it.'
        ]);
        exit;
    }

    // Block redundant modifications if the transaction is already finalized
    if ($resCheck['status'] === 'cancelled') {
        echo json_encode([
            'status' => 'error',
            'message' => 'This booking has already been cancelled.'
        ]);
        exit;
    }

    // Step 2: Commit status transformation to persistent relational storage
    $updateSql = "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ? AND user_id = ?";
    $stmtUpdate = $conn->prepare($updateSql);
    $stmtUpdate->bind_param("ii", $bookingId, $userId);
    $stmtUpdate->execute();

    // Step 3: Verify execution matrix rows affected status and respond
    if ($stmtUpdate->affected_rows > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Booking successfully cancelled.'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to update booking status. Try again later.'
        ]);
    }

} catch (Exception $e) {
    // Structural fallback path to catch database transmission issues safely
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>