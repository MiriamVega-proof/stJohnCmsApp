<?php
session_start();
require_once "db_connect.php";

header('Content-Type: application/json');

function sendResponse($success, $message = "", $data = []) {
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);
    exit;
}

try {
    // Get current month and year
    $currentMonth = date('m');
    $currentYear = date('Y');
    
    // Count maintenance requests by status
    $pendingSql = "SELECT COUNT(*) as count FROM maintenancerequest WHERE status = 'Pending'";
    $pendingResult = $conn->query($pendingSql);
    $pendingCount = $pendingResult->fetch_assoc()['count'];
    
    // Count completed requests for current month (using updatedAt for completion date)
    $completedSql = "SELECT COUNT(*) as count FROM maintenancerequest 
                     WHERE status = 'Completed' 
                     AND MONTH(COALESCE(updatedAt, createdAt)) = ? 
                     AND YEAR(COALESCE(updatedAt, createdAt)) = ?";
    $stmt = $conn->prepare($completedSql);
    $stmt->bind_param("ii", $currentMonth, $currentYear);
    $stmt->execute();
    $completedResult = $stmt->get_result();
    $completedCount = $completedResult->fetch_assoc()['count'];
    
    // Count cancelled requests (total)
    $cancelledSql = "SELECT COUNT(*) as count FROM maintenancerequest WHERE status = 'Cancelled'";
    $cancelledResult = $conn->query($cancelledSql);
    $cancelledCount = $cancelledResult->fetch_assoc()['count'];
    
    $counts = [
        'pending' => (int)$pendingCount,
        'completed' => (int)$completedCount,
        'cancelled' => (int)$cancelledCount,
        'month' => (int)$currentMonth,
        'year' => (int)$currentYear
    ];
    
    sendResponse(true, "Maintenance counts fetched successfully", $counts);
    
} catch (Exception $e) {
    sendResponse(false, "Error: " . $e->getMessage());
}

$conn->close();
?>