<?php
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

try{
    $userSql = "SELECT * FROM users WHERE user_id = ?";
    $userStmt = $conn->prepare($userSql);
    $userStmt->bind_param('i', $userId);
    $userStmt->execute();
    $userResult = $userStmt->get_result()->fetch_assoc();

    if(!isset($userResult)){
        echo json_encode([
            'status' => 'error',
            'message' => 'User not found'
        ]);
        exit;
    }

    $avatar = $userResult['user_photo'] ? $userResult['user_photo'] : 'https://i.ibb.co/hx5WyV7z/person.png';

    $bookingsSql = "SELECT b.*, o.name AS offer_name, o.category FROM bookings b JOIN offers o ON b.offer_id = o.offer_id WHERE b.user_id = ? ORDER BY b.created_at DESC";
    $bookingStmt = $conn->prepare($bookingsSql);
    $bookingStmt->bind_param('i', $userId);
    $bookingStmt->execute();
    $bookingResult = $bookingStmt->get_result();

    $bookings = [];
    while($row=$bookingResult->fetch_assoc()){
        $bookings[] = $row;
    }

    $myOffersSql = "SELECT * FROM offers WHERE user_id = ? ORDER BY offer_id DESC";
    $myOffersStmt = $conn->prepare($myOffersSql);
    $myOffersStmt->bind_param('i', $userId);
    $myOffersStmt->execute();
    $myOffersResult = $myOffersStmt->get_result();

    $myOffers = [];
    while($row=$myOffersResult->fetch_assoc()){
        $myOffers[] = $row;
    }

    echo json_encode([
        'status' => 'success',
        'userInfo' => $userResult,
        'avatar' => $avatar,
        'bookings' => $bookings,
        'myOffers' => $myOffers 
    ]);

}catch(Exception $e){
    echo json_encode([
        'status' => 'error',
        'message' => 'DB error: ' . $e->getMessage()
    ]);
}
?>