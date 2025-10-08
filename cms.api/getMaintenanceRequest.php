<?php
session_start();
require_once "db_connect.php";

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "User not logged in",
        "data" => []
    ]);
    exit;
}

$userId = $_SESSION['user_id'];
$mode = $_GET['mode'] ?? 'history'; // default: request history

if ($mode === 'lots') {
    // ✅ Fetch user's reserved lots (for <select> dropdown)
    $sql = "SELECT 
                r.reservationId, 
                r.clientName, 
                r.area, 
                r.block, 
                r.rowNumber,
                r.lotNumber, 
                r.lotTypeId,
                lt.typeName AS lot_type_name,
                lt.price,
                lt.monthlyPayment
            FROM reservations r
            LEFT JOIN lot_types lt ON r.lotTypeId = lt.lotTypeId
            WHERE r.userId = ?
            ORDER BY r.clientName, lt.typeName, r.area, r.block, r.rowNumber, r.lotNumber";
} 
else {
    // ✅ Fetch maintenance request history
    $sql = "SELECT 
                m.requestId, 
                m.serviceType, 
                m.status, 
                m.requestedDate, 
                m.notes,
                r.area, 
                r.block, 
                r.rowNumber, 
                r.lotNumber
            FROM maintenancerequest m
            JOIN reservations r ON m.reservationId = r.reservationId
            WHERE m.userId = ?
            ORDER BY m.requestedDate DESC";
}

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL prepare failed: " . $conn->error,
        "data" => []
    ]);
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $data
], JSON_PRETTY_PRINT);

$stmt->close();
$conn->close();
?>
