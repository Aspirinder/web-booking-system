<?php
include_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
$limit = 20;


if (!$data) {
    echo json_encode(["error" => "No data provided"]);
    exit;
}

$category = $data["category"];
$locations = "%" . $data["location"] . "%";
$checkIn = $data["checkIn"];
$checkOut = $data["checkOut"];
$selectedBenefits = isset($data["benefits"]) ? $data["benefits"] : [];

$sql = "SELECT * FROM offers 
        WHERE category = ? 
        AND (
            city LIKE ? 
            OR country LIKE ? 
            OR CONCAT(city, ', ', country) LIKE ? 
            OR CONCAT(city, ' ', country) LIKE ?
        )
        AND offer_id NOT IN (
            SELECT offer_id FROM bookings 
            WHERE check_in < ? AND check_out > ? 
            AND status != 'cancelled'
        )";

if(!empty($selectedBenefits)){
    $ids = implode(',', array_map('intval', $selectedBenefits));
    $count = count($selectedBenefits);

    $sql .= " AND offer_id IN (SELECT offer_id FROM offers_benefits WHERE benefit_id IN ($ids) GROUP BY offer_id HAVING COUNT(DISTINCT benefit_id) = $count)";
}

$sql .= " LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);

$stmt->bind_param("sssssssii", $category, $locations, $locations, $locations, $locations, $checkOut, $checkIn, $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$offers = [];

while($row = $result->fetch_assoc()) {
    $offerId = $row['offer_id'];
    $benefitsSql = "SELECT b.* FROM benefits b JOIN offers_benefits ob ON b.benefit_id = ob.benefit_id WHERE ob.offer_id = ?";

    $stmtB = $conn->prepare($benefitsSql);
    $stmtB->bind_param("i", $offerId);
    $stmtB->execute();
    $resultB = $stmtB->get_result();

    $row['benefits'] = [];
    while($benefit = $resultB->fetch_assoc()){
        $row['benefits'][] = $benefit;
    }
    $offers[] = $row;
}

echo json_encode($offers);
?>