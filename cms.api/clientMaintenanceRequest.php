<?php
// Inserts a new maintenance request into the database.
require_once "db_connect.php";
session_start();

// Ensures the user is logged in before allowing a submission.
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $reservationId = $_POST['reservationId'] ?? null;
    $serviceType = $_POST['serviceType'] ?? null;
    $notes = $_POST['notes'] ?? "";
    $userId = $_SESSION['user_id'];

    // Validates that all required fields are present.
    if (empty($reservationId) || empty($serviceType)) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    // Inserts the new request into the 'maintenancerequest' table.
    $sql = "INSERT INTO maintenancerequest (userId, reservationId, serviceType, requestedDate, notes, status)
            VALUES (?, ?, ?, NOW(), ?, 'Pending')";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Error preparing statement: " . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("iiss", $userId, $reservationId, $serviceType, $notes);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Maintenance request submitted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error submitting request: " . $stmt->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>