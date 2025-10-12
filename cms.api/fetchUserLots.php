<?php
session_start();
require_once "db_connect.php";

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "User not logged in",
        "data" => []
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Fetch lots for the logged-in user with user information
    $sql = "SELECT 
                l.lotId,
                l.userId,
                l.area,
                l.block,
                l.lotNumber,
                l.type,
                l.burialDepth,
                l.status,
                l.createdAt,
                l.updatedAt,
                u.firstName,
                u.lastName,
                u.email
            FROM lots l
            LEFT JOIN user u ON l.userId = u.userId
            WHERE l.userId = ? 
            AND l.status IN ('Reserved', 'Occupied')
            ORDER BY l.area, l.block, l.lotNumber";

    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("SQL prepare failed: " . $conn->error);
    }

    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $lots = [];
    while ($row = $result->fetch_assoc()) {
        // Combine first and last name for client name
        $clientName = trim($row['firstName'] . ' ' . $row['lastName']);
        if (empty($clientName)) {
            $clientName = $row['email']; // Fallback to email if no name
        }
        
        $lots[] = [
            'lotId' => $row['lotId'],
            'clientName' => $clientName,
            'area' => $row['area'],
            'block' => $row['block'],
            'lotNumber' => $row['lotNumber'],
            'type' => $row['type'],
            'burialDepth' => $row['burialDepth'],
            'status' => $row['status'],
            'createdAt' => $row['createdAt'],
            'updatedAt' => $row['updatedAt']
        ];
    }

    echo json_encode([
        "status" => "success",
        "data" => $lots,
        "count" => count($lots)
    ]);

    $stmt->close();

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage(),
        "data" => []
    ]);
}

$conn->close();
?>