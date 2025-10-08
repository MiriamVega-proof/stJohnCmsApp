<?php
require_once "db_connect.php";
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

$userId = $_SESSION['user_id'];

$sql = "SELECT reservationId, area, block, lotNumber
        FROM reservations
        WHERE userId = ?
        ORDER BY area, block, lotNumber";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$lots = [];
while ($row = $result->fetch_assoc()) {
    $lots[] = $row;
}

echo json_encode($lots);

$stmt->close();
$conn->close();
?>
