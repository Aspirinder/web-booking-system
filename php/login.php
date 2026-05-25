<?php
session_start();

include_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['log_email'];
$password = $data['log_password'];

$sql = "SELECT * FROM users WHERE email='$email'";
$result = $conn->query($sql);

if($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if(password_verify($password, $user["password_hash"])) {

        $_SESSION['user_id'] = $user['user_id'];
    
        echo json_encode([
            "status"=> "success",
            "message"=> "Welcome back, " . $user['fullname'],
            "user" => [
                "id" => $user["user_id"],
                "name" => $user["fullname"]
            ]
        ]);
    }else{
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    }
}else{
    echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
}

?>