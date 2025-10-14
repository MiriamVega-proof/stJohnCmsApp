<?php
require_once "db_connect.php";
header("Content-Type: application/json");

// POST: Save new appointment
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $clientName = $data["user_name"] ?? "";
    $clientAddress = $data["user_address"] ?? "";
    $clientContactNumber = $data["user_phone"] ?? "";
    $dateRequested = $data["appointment_date"] ?? "";
    $time = $data["appointment_time"] ?? "";
    $purpose = $data["appointment_purpose"] ?? "";

    if (!$clientName || !$clientContactNumber || !$dateRequested) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO appointments (
            clientId,
            clientName,
            clientAddress,
            clientContactNumber,
            dateRequested,
            time,
            purpose,
            statusId,
            createdAt
        ) VALUES (
            NULL, ?, ?, ?, ?, ?, ?, 0, NOW()
        )
    ");

    $stmt->bind_param("ssssss", $clientName, $clientAddress, $clientContactNumber, $dateRequested, $time, $purpose);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Appointment saved successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// GET: Fetch all appointments
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $result = $conn->query("SELECT appointmentId AS id, clientName AS client, dateRequested AS date, time, purpose AS notes FROM appointments");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
    $conn->close();
}
?>
