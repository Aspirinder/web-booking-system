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

$hostUserId = $_SESSION['user_id'];

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Malformed data stream. Failed to parse explicit JSON payload context.'
    ]);
    exit;
}

try{
    $conn->begin_transaction();

    $primaryPhoto = !empty($data['images']) ? $data['images'][0] : 'https://i.ibb.co/4ZD757xf/no-image.png';

    $sqlOffer = "INSERT INTO offers (`user_id`, `category`, `name`, `price`, `img`, `country`, `city`, `description`, `rating`)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, '4.0')";
    
    $stmtO = $conn->prepare($sqlOffer);
    $stmtO->bind_param("issdssss", $hostUserId, $data['category'], $data['name'], $data['price'], $primaryPhoto, $data['country'], $data['city'], $data['description']);

    $stmtO->execute();

    $newOfferId = $conn->insert_id;
    $stmtO->close();

    if(!empty($data['images']) && is_array($data['images'])){
        $sqlImage = "INSERT INTO photos (`offer_id`, `photo_url`) VALUES (?, ?)";
        $stmtI = $conn->prepare($sqlImage);

        foreach ($data['images'] as $imageUrl) {
            if (!empty($imageUrl)) {
                $stmtI->bind_param("is", $newOfferId, $imageUrl);
                $stmtI->execute();
            }
        }
        $stmtI->close();
    }

    $isHousing = in_array($data['category'], ['Apartments', 'Villas', 'Castles']);
    $details = isset($data['details']) ? $data['details'] : [];

    if($isHousing){
        $sqlHousing = "INSERT INTO realty_details (`offer_id`, `street`, `house_number`, `rooms_count`, `floor`, `square`) 
                       VALUES (?, ?, ?, ?, ?, ?)";

        $stmtH = $conn->prepare($sqlHousing);

        $street = isset($details['street']) ? $details['street'] : null;
        $houseNumber = isset($details['house_number']) ? $details['house_number'] : null;
        $rooms = isset($details['rooms']) ? intval($details['rooms']) : 0;
        $floor = isset($details['floor']) ? intval($details['floor']) : 0;
        $area = isset($details['area']) ? intval($details['area']) : 0;

        $stmtH->bind_param("issiii", $newOfferId, $street, $houseNumber, $rooms, $floor, $area);
        $stmtH->execute();
        $stmtH->close();
    }else{
        $sqlTransport = "INSERT INTO transport_details (`offer_id`, `model_year`, `fuel_type`, `transmission`, `max_passengers`, `max_speed`, `is_pilot_included`) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)";
                         
        $stmtT = $conn->prepare($sqlTransport);

        $year = isset($details['year']) ? intval($details['year']) : 0;
        $fuel = isset($details['fuel']) ? $details['fuel'] : null;
        $transmission = isset($details['transmission']) ? $details['transmission'] : null;
        $maxSpeed = isset($details['max_speed']) ? intval($details['max_speed']) : 0;
        $passengers = isset($details['passengers']) ? intval($details['passengers']) : 0;
        $driver = isset($details['driver']) ? intval($details['driver']) : 0;

        $stmtT->bind_param("iissiii", $newOfferId, $year, $fuel, $transmission, $maxSpeed, $passengers, $driver);
        $stmtT->execute();
        $stmtT->close();
    }

    if (!empty($data['benefits']) && is_array($data['benefits'])) {
        $sqlMapRelation = "INSERT INTO offers_benefits (`offer_id`, `benefit_id`) VALUES (?, ?)";
        $stmtM = $conn->prepare($sqlMapRelation);

        foreach ($data['benefits'] as $benefitObj) {
            $benefitId = isset($benefitObj['id']) ? intval($benefitObj['id']) : 0;
            
            if ($benefitId <= 0) continue;
            $stmtM->bind_param("ii", $newOfferId, $benefitId);
            $stmtM->execute();
        }
        
        $stmtM->close();
    }

    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Listing entry successfully registered within active transactional pipelines.',
        'offer_id' => $newOfferId
    ]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'status' => 'error',
        'message' => 'Critical storage transaction failure encountered: ' . $e->getMessage()
    ]);
}
?>