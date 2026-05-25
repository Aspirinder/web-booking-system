<?php
    include 'db.php';
    header('Content-Type: application/json; charset=utf-8');

    session_start();

    if(!isset($_SESSION['user_id'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'User is not Log In'
        ]);
        exit;
    }


    $data = json_decode(file_get_contents('php://input'), true);
    
    if(empty($data['offer_id']) || empty($data['check_in']) || empty($data['check_out']) || empty($data['payment_method']) || empty($data['total_price'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required booking parametrs.'
        ]);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $offerId = $data['offer_id'];
    $checkIn = $data['check_in'];
    $checkOut = $data['check_out'];
    $totalPrice = $data['total_price'];
    $currency = $data['currency'];
    $paymentMethod = $data['payment_method'];

    try{
        $checkSql = "SELECT COUNT(*) FROM bookings WHERE offer_id = ? AND (check_in <= ? AND check_out >= ?)";
        $stmtC = $conn->prepare($checkSql);
        $stmtC->bind_param("iss", $offerId, $checkOut, $checkIn);
        $stmtC->execute();
        $isBooked = $stmtC->get_result()->fetch_row()[0];

        if($isBooked > 0){
            echo json_encode([
                'status' => 'error',
                'message' => 'Dates are already booked. Refresh page and choose other dates.'
            ]);
            exit;
        }

        $insertSql = "INSERT INTO bookings (offer_id, user_id, check_in, check_out, total_price, currency, status, payment_method, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW())";
        $stmtI = $conn->prepare($insertSql);
        $stmtI->bind_param("iissdss", $offerId, $userId, $checkIn, $checkOut, $totalPrice, $currency, $paymentMethod);
        $stmtI->execute();

        if($stmtI->affected_rows > 0){
            echo json_encode([
                'status' => 'success',
                'message' => 'Booking successfully created!'
            ]);
        }else{
            echo json_encode([
                'status' => 'error',
                'message' => 'Faiild to save booking to DB'
            ]);
        }

    }catch(Exception $e){
        echo json_encode([
            'status' => 'error',
            'message' => 'DB Error: ' . $e->getMessage()
        ]);
    }
?>