<?php

include_once 'db.php';

$cat = $_GET['category'] ?? 'Apartments';
$sql = "SELECT * FROM offers WHERE category = '$cat'";
$result = $conn->query($sql);

$offers = [];
while ($row = $result->fetch_assoc()) {
    $offers[] = $row;
}

header('Content-Type: application/json');
echo json_encode($offers);
?>