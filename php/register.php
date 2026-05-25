<?php

include_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['reg_username'];
$fullname = $data['reg_fullname'];
$email = $data['reg_email'];
$password = password_hash($data['reg_password'], PASSWORD_BCRYPT);

$check = $conn->query("SELECT user_id FROM users WHERE email='$email' OR username='$username'");
if ($check->num_rows != 0) {
    echo json_encode(["status"=> "error","message"=> "User already exists or username is taken."]);
}else{
    $sql = "INSERT INTO users(username, fullname, email, password_hash)
    VALUES('$username', '$fullname', '$email', '$password')";
    if($conn->query($sql)){
        echo json_encode(['status' => 'success', 'message' => 'Registration complete!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
}
?>