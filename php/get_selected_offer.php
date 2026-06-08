<?php
//  Step 1: Securely load core database connection config handler 
include_once 'db.php';

// Safe layout fallback translation check for identification parameter keys
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if($id === 0){
    echo json_encode(["error" => "Invalid ID"]);
    exit;
}

//  Step 2: Fetch primary offer metadata entry record from storage 
$sql = "SELECT * FROM offers WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$offer = $stmt->get_result()->fetch_assoc();

if(!$offer){
    echo json_encode(["error" => "Offer not found"]);
    exit;
}

//  Step 3: Fetch related system amenities entries utilizing relational JOINS 
$benefitsSql = "SELECT b.* FROM benefits b 
    JOIN offers_benefits ob ON b.benefit_id = ob.benefit_id 
    WHERE ob.offer_id = ?";

$benefits = [];
$stmtB = $conn->prepare($benefitsSql);
$stmtB->bind_param("i", $id);
$stmtB->execute();
$resB = $stmtB->get_result();
while($row = $resB->fetch_assoc()){
    $benefits[] = $row;
}

//  Step 4: Extract supplemental gallery photo URLs paths collection 
$photos = [];
$photosSql = "SELECT photo_url FROM photos WHERE offer_id = ?";
$stmtP = $conn->prepare($photosSql);
$stmtP->bind_param("i", $id);
$stmtP->execute();
$resP = $stmtP->get_result();
while($row = $resP->fetch_assoc()){
    $photos[] = $row['photo_url'];
}

//  Step 5: Evaluate categorical archetype to query specialized details 
$detailsSql = '';
if($offer['category'] === "Apartments" || $offer['category'] === "Castles" || $offer['category'] === "Villas"){
    $detailsSql = "SELECT * FROM realty_details WHERE offer_id = ?";
} else {
    $detailsSql = "SELECT * FROM transport_details WHERE offer_id = ?";
}

$stmtD = $conn->prepare($detailsSql);
$stmtD->bind_param("i", $id);
$stmtD->execute();
$details = $stmtD->get_result()->fetch_assoc();

//  Step 6: Query chronological historical timeline calendar tracking events 
$bookings = [];
$bookingsSql = "SELECT * FROM bookings WHERE offer_id = ? AND status != 'cancelled'";
$stmtBookings = $conn->prepare($bookingsSql);
$stmtBookings->bind_param("i", $id);
$stmtBookings->execute();
$resBookings = $stmtBookings->get_result();
while($row = $resBookings->fetch_assoc()){
    $bookings[] = $row;
}

//  Step 7: Assemble standalone payload properties into a unified deep object 
$offer['benefits'] = $benefits;
$offer['photos'] = $photos;
$offer['details'] = $details;
$offer['bookings'] = $bookings;

// Stream fully unified dataset model formatted as standard JSON package
header('Content-Type: application/json');
echo json_encode($offer);
?>