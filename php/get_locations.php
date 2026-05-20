<?php
include_once 'db.php';

$query = isset($_GET['q']) ? $_GET['q'] :'';

if(strlen($query) >= 3){
    $stmt = $conn->prepare("SELECT DISTINCT city, country FROM offers WHERE city LIKE ? OR country LIKE ? LIMIT 5");
    $searchTerm = "%$query%";
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $locations = [];

    while($row = $result->fetch_assoc()){
        $locations[] = [
            'display' => $row['city'] . ", " . $row["country"],
            'city' => $row['city']
        ];
    }

    echo json_encode($locations);
}

?>