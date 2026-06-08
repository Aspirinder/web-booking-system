<?php
include_once 'db.php';

// Step 1: Parse input stream and pagination variables
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

// Step 2: Build base query verifying category, locations, and availability
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

// Define initial base parameter type mapping rules and tracking collections
$types = "sssssss";
$params = [$category, $locations, $locations, $locations, $locations, $checkOut, $checkIn];

// Step 3: Append relational exact-match filter rules for chosen amenities
if(!empty($selectedBenefits)){
    $ids = implode(',', array_map('intval', $selectedBenefits));
    $count = count($selectedBenefits);

    $sql .= " AND offer_id IN (SELECT offer_id FROM offers_benefits WHERE benefit_id IN ($ids) GROUP BY offer_id HAVING COUNT(DISTINCT benefit_id) = $count)";
}

// Append pagination matrix limits dynamically
$sql .= " LIMIT ? OFFSET ?";
$types .= "ii";
$params[] = $limit;
$params[] = $offset;

// Step 4: Execute dynamic query context execution
$stmt = $conn->prepare($sql);

// Bind built dynamic tracking arguments array unpack references safely
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$offers = [];

// Step 5: Hydrate relational nested perks tokens in secondary loop iteration
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

// Step 6: Return final complex filtering payload package as JSON
echo json_encode($offers);
?>