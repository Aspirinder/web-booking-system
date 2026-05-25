<?php
include 'db.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access. Please log in.'
    ]);
    exit;
}

if (empty($_GET['id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing booking ID parameter.'
    ]);
    exit;
}

$bookingId = intval($_GET['id']);

try{
    $sql = "SELECT b.*, o.name AS offer_name, u.fullname AS host_name FROM bookings b
        JOIN offers o ON b.offer_id = o.offer_id
        JOIN users u ON o.user_id = u.user_id
        WHERE b.booking_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $bookingId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    if($result){
        echo json_encode([
            'status' => 'success',
            'booking' => $result
        ]);
    }else{
        echo json_encode([
            'status' => 'error',
            'message' => 'Booking not found or you do not have permission to view it.'
        ]);
    }

}catch(Exception $e){
    echo json_encode([
        'status' => 'error',
        'message' => 'DB error: ' . $e->getMessage()
    ]);
}
?>