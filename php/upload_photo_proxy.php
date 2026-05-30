<?php
/**
 * php/upload_avatar_proxy.php
 * Secure proxy script to forward multipart image binaries directly to ImgBB API.
 */

// 1. Set strict JSON response headers
header('Content-Type: application/json; charset=utf-8');

// 3. Verify if the file data packet exists inside global arrays
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = isset($_FILES['image']) ? $_FILES['image']['error'] : 'No file node detected';
    echo json_encode([
        'status' => 'error',
        'error' => ['message' => 'File transmission upload failed or file node missing. Error code: ' . $errorCode]
    ]);
    exit;
}

$env = parse_ini_file(__DIR__ . '/../.env');
$imgbbKey = isset($env['IMGBB_API_KEY']) ? $env['IMGBB_API_KEY'] : '';

try {
    if (empty($imgbbKey)) {
        echo json_encode(['status' => 'error', 'message' => 'API Key configuration missing on server.']);
        exit;
    }

    $filePath = $_FILES['image']['tmp_name'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.imgbb.com/1/upload?key=' . $imgbbKey);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, ['image' => new CURLFile($filePath)]);

    $response = curl_exec($ch);
    $imgbbData = json_decode($response, true);

    if (isset($imgbbData['success']) && $imgbbData['success'] === true) {
        // Build streamlined internal response standard contract matching your JS client calls
        echo json_encode([
            'status' => 'success',
            'url' => $imgbbData['data']['url'] // Direct absolute image URL from remote server
        ]);
    } else {
        // Forward server error specifications directly to client context logging systems
        echo json_encode([
            'status' => 'error',
            'error' => ['message' => isset($imgbbData['error']['message']) ? $imgbbData['error']['message'] : 'ImgBB engine rejection.']
        ]);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'error' => ['message' => $e->getMessage()]]);
}