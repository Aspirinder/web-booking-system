<?php
include 'db.php';

session_start();
header('Content-Type: application/json; charset=utd-8');

if(!isset($_SESSION['user_id'])){
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access.'
    ]);
    exit;
}
$userId = $_SESSION['user_id'];

if(!isset($_FILES['image'])){
    echo json_encode([
        'status' => 'error',
        'message' => 'No File uploaded'
    ]);
    exit;
}

$env = parse_ini_file(__DIR__ . '/../.env');
$imgbbKey = isset($env['IMGBB_API_KEY']) ? $env['IMGBB_API_KEY'] : '';

if (empty($imgbbKey)) {
    echo json_encode(['status' => 'error', 'message' => 'API Key configuration missing on server.']);
    exit;
}

$filePath = $_FILES['image']['tmp_name'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.imgbb.com/1/upload?key=' . $imgbbKey);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'image' => new CURLFile($filePath)
]);

$response = curl_exec($ch);
$result = json_decode($response, true);

if (isset($result['success']) && $result['success']) {
    try{
        $newImgUrl = $result['data']['url'];

        $sql = "UPDATE users SET user_photo = ? WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $newImgUrl, $userId);
    
        if ($stmt->execute()) echo json_encode(['status' => 'success', 'url' => $newImgUrl]);
        else echo json_encode(['status' => 'error', 'message' => 'DB update failed']);

    }catch(Exception $e){ echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);}

} else echo json_encode(['status' => 'error', 'message' => 'ImgBB error']);
?>

