<?php

include 'db.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access. Please log in again.'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['booking_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing booking ID.'
    ]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$bookingId = intval($data['booking_id']);

try {
    $checkSql = "SELECT status FROM bookings WHERE booking_id = ? AND user_id = ?";
    $stmtCheck = $conn->prepare($checkSql);
    $stmtCheck->bind_param("ii", $bookingId, $userId);
    $stmtCheck->execute();
    $resCheck = $stmtCheck->get_result()->fetch_assoc();

    if (!$resCheck) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Booking not found or you do not have permission to cancel it.'
        ]);
        exit;
    }

    if ($resCheck['status'] === 'cancelled') {
        echo json_encode([
            'status' => 'error',
            'message' => 'This booking has already been cancelled.'
        ]);
        exit;
    }

    $updateSql = "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ? AND user_id = ?";
    $stmtUpdate = $conn->prepare($updateSql);
    $stmtUpdate->bind_param("ii", $bookingId, $userId);
    $stmtUpdate->execute();

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
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>