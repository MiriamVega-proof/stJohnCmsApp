<?php
require_once "db_connect.php";

header('Content-Type: application/json');

// Simple query to get ALL reservations (for testing)
$sql = "SELECT reservationId, area, block, lotNumber, userId
        FROM reservations
        ORDER BY reservationId DESC";

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $reservations = [];
    while ($row = $result->fetch_assoc()) {
        $reservations[] = $row;
    }

    // Add debug info
    $response = [
        'success' => true,
        'count' => count($reservations),
        'data' => $reservations,
        'debug' => [
            'query_executed' => true,
            'table_exists' => true
        ]
    ];

    echo json_encode($response);

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'query_executed' => false,
            'error_details' => $e->getTrace()
        ]
    ]);
}

$conn->close();
?>