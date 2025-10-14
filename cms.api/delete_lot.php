<?php
// delete_lot.php
session_start();
header("Content-Type: application/json");
require "db_connect.php";

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['lotId'])) {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM lots WHERE lotId = ?");
    $stmt->bind_param("i", $data['lotId']);

    $success = $stmt->execute();
    echo json_encode(["success" => $success]);

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}