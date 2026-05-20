<?php

include_once 'db.php';

$sql = "SELECT DISTINCT * FROM benefits";
$result = $conn->query($sql);

$benefits = [];
while ($row = $result->fetch_assoc()) {
    $benefits[] = $row;
}

header('Content-Type: application/json');
echo json_encode($benefits);
?>