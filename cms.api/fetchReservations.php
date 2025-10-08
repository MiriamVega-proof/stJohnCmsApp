<?php
require_once "db_connect.php";
session_start();

header('Content-Type: application/json');

// For admin dashboard, get ALL reservations (remove session check)
// if (!isset($_SESSION['user_id'])) {
//     echo json_encode([]);
//     exit;
// }

try {
    // Get all reservations for admin dashboard
    $sql = "SELECT reservationId, area, block, lotNumber, userId, createdAt
            FROM reservations
            ORDER BY reservationId DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $reservations = [];
    $todayCount = 0;
    $today = date('Y-m-d'); // Get today's date in YYYY-MM-DD format
    
    while ($row = $result->fetch_assoc()) {
        $reservations[] = $row;
        
        // Check if reservation was made today
        if ($row['createdAt']) {
            $reservationDate = date('Y-m-d', strtotime($row['createdAt']));
            if ($reservationDate === $today) {
                $todayCount++;
            }
        }
    }

    // Return structured response for dashboard
    $response = [
        'success' => true,
        'totalCount' => count($reservations),
        'todayCount' => $todayCount,
        'today' => $today,
        'data' => $reservations
    ];

    echo json_encode($response);

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'totalCount' => 0,
        'todayCount' => 0,
        'data' => []
    ]);
}

$conn->close();
?>
