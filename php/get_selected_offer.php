<?php
include_once 'db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if($id === 0){
    echo json_encode(["error" => "Invalid ID"]);
    exit;
}

$sql = "SELECT * FROM offers WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$offer = $stmt->get_result()->fetch_assoc();

if(!$offer){
    echo json_encode(["error" => "Offer not found"]);
    exit;
}

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

$photos = [];
$photosSql = "SELECT photo_url FROM photos WHERE offer_id = ?";
$stmtP = $conn->prepare($photosSql);
$stmtP->bind_param("i", $id);
$stmtP->execute();
$resP = $stmtP->get_result();
while($row = $resP->fetch_assoc()){
    $photos[] = $row['photo_url'];
}


$detailsSql = '';
if($offer['category'] === "Apartments" || $offer['category'] === "Castles" || $offer['category'] === "Villas"){
    $detailsSql = "SELECT * FROM realty_details WHERE offer_id = ?";
}else{
    $detailsSql = "SELECT * FROM transport_details WHERE offer_id = ?";
}

$stmtD = $conn->prepare($detailsSql);
$stmtD->bind_param("i", $id);
$stmtD->execute();
$details = $stmtD->get_result()->fetch_assoc();;

$offer['benefits'] = $benefits;
$offer['photos'] = $photos;
$offer['details'] = $details;

header('Content-Type: application/json');
echo json_encode($offer);
?>