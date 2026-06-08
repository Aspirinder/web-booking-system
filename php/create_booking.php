<?php
    include 'db.php';
    header('Content-Type: application/json; charset=utf-8');

    session_start();

    // Security Guard: Authenticate active session
    if(!isset($_SESSION['user_id'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'User is not Log In'
        ]);
        exit;
    }

    // Payload Validation: Parse and verify raw JSON input stream
    $data = json_decode(file_get_contents('php://input'), true);
    
    if(empty($data['offer_id']) || empty($data['check_in']) || empty($data['check_out']) || empty($data['payment_method']) || empty($data['total_price'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required booking parameters.'
        ]);
        exit;
    }

    // Assign payload variables properties context
    $userId = $_SESSION['user_id'];
    $offerId = $data['offer_id'];
    $checkIn = $data['check_in'];
    $checkOut = $data['check_out'];
    $totalPrice = $data['total_price'];
    $currency = $data['currency'];
    $paymentMethod = $data['payment_method'];

    try{
        // Step 1: Check for date collision overlap (Anti-Overbooking guard)
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

        // Step 2: Insert new transactional entity entry into persistent storage
        $insertSql = "INSERT INTO bookings (offer_id, user_id, check_in, check_out, total_price, currency, status, payment_method, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW())";
        $stmtI = $conn->prepare($insertSql);
        
        $stmtI->bind_param("iissdss", $offerId, $userId, $checkIn, $checkOut, $totalPrice, $currency, $paymentMethod);
        $stmtI->execute();

        // Step 3: Verify execution matrix rows affected status and respond
        if($stmtI->affected_rows > 0){
            echo json_encode([
                'status' => 'success',
                'message' => 'Booking successfully created!'
            ]);
        }else{
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to save booking to DB'
            ]);
        }

    }catch(Exception $e){
        // Structural fallback path to catch database transmission issues safely
        echo json_encode([
            'status' => 'error',
            'message' => 'DB Error: ' . $e->getMessage()
        ]);
    }
?>