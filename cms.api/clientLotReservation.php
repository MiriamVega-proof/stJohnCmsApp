<?php
require_once "db_connect.php";
session_start();

// ✅ Set header to JSON for all responses
header("Content-Type: application/json");

// ✅ Check user session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Authentication required. Please log in."]);
    exit;
}

$userId = $_SESSION['user_id'];

// ✅ Create upload folder if not exists
$uploadDir = __DIR__ . "/uploads/";
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to create upload directory."]);
        exit;
    }
}

// ✅ File upload handler function
function saveFile($fileInputName, $uploadDir) {
    if (isset($_FILES[$fileInputName]) && $_FILES[$fileInputName]['error'] === UPLOAD_ERR_OK) {
        // Sanitize filename
        $fileName = time() . "_" . preg_replace("/[^a-zA-Z0-9.\-_]/", "_", basename($_FILES[$fileInputName]['name']));
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES[$fileInputName]['tmp_name'], $targetPath)) {
            // Return relative path for database
            return "uploads/" . $fileName;
        }
    }
    return null;
}

/* ---------------------------------------------------
   GET: Display Reservation History
--------------------------------------------------- */
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT r.reservationId, r.clientName, r.address, r.contactNumber,
                   r.clientValidId, r.reservationDate, r.area, r.block, r.rowNumber,
                   r.lotNumber, lt.typeName AS lotType, lt.price, r.status
            FROM reservations r
            LEFT JOIN lot_types lt ON r.lotTypeId = lt.lotTypeId
            WHERE r.userId = ?
            ORDER BY r.createdAt DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $history = [];
    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $history
    ]);
    exit;
}

/* ---------------------------------------------------
   POST: Save Reservation
--------------------------------------------------- */
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $lotId = 0; // Assuming lotId is not yet assigned
    $clientName      = trim($_POST["client_name"] ?? '');
    $address         = trim($_POST["client_address"] ?? '');
    $contactNumber   = trim($_POST["client_contact"] ?? '');
    $deceasedName    = empty(trim($_POST["deceased_name"])) ? null : trim($_POST["deceased_name"]);
    $burialDate      = empty(trim($_POST["burial_date"])) ? null : trim($_POST["burial_date"]);
    $reservationDate = trim($_POST["reservation_date"] ?? '');
    $area            = trim($_POST["area"] ?? '');
    $block           = trim($_POST["block"] ?? '');
    $row_number      = trim($_POST["row_number"] ?? ''); // ✅ Correct variable name
    $lotNumber       = trim($_POST["lot_number"] ?? '');
    $burialDepth     = trim($_POST["burial_depth"] ?? '');
    $notes           = trim($_POST["additional_notes"] ?? '');
    $lotTypeId       = isset($_POST['lotTypeId']) && $_POST['lotTypeId'] !== '' ? (int)$_POST['lotTypeId'] : null;

    if (empty($clientName) || empty($address) || empty($contactNumber) || empty($reservationDate) || $lotTypeId === null) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields. Please fill all fields marked with *."]);
        exit;
    }

    // ✅ Handle file uploads
    $clientValidId    = saveFile("client_id_upload", $uploadDir);
    $deathCertificate = saveFile("death_certificate_upload", $uploadDir);
    $deceasedValidId  = saveFile("deceased_id_upload", $uploadDir);
    $burialPermit     = saveFile("burial_permit_upload", $uploadDir);

    if (empty($clientValidId)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Client's Valid ID is a required document."]);
        exit;
    }

    $status    = "For Reservation";
    $createdAt = date("Y-m-d H:i:s");

    // ✅ Insert into reservations
    $sql = "INSERT INTO reservations (
        lotId, userId, clientName, address, contactNumber, deceasedName, burialDate, reservationDate,
        area, block, rowNumber, lotNumber, burialDepth, notes, clientValidId, deathCertificate, deceasedValidId,
        burialPermit, status, createdAt, lotTypeId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database prepare error: " . $conn->error]);
        exit;
    }

    // ✅ FIXED: Corrected variable $rowNumber to $row_number
    $stmt->bind_param(
        "iissssssssssssssssssi",
        $lotId, $userId, $clientName, $address, $contactNumber, $deceasedName, $burialDate,
        $reservationDate, $area, $block, $row_number, $lotNumber, $burialDepth, $notes,
        $clientValidId, $deathCertificate, $deceasedValidId, $burialPermit, $status, $createdAt, $lotTypeId
    );

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to save reservation: " . $stmt->error]);
        $stmt->close();
        $conn->close();
        exit;
    }

    $reservationId = $stmt->insert_id;
    $stmt->close();

    // ✅ Insert into burials only if deceased name is provided
    if ($deceasedName && $burialDate) {
        $sqlBurial = "INSERT INTO burials (
            userId, lotId, reservationId, deceasedName, burialDate,
            area, block, rowNumber, lotNumber, deceasedValidId, deathCertificate, burialPermit, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmtBurial = $conn->prepare($sqlBurial);
        if ($stmtBurial) {
            // ✅ FIXED: Corrected variable $rowNumber to $row_number
            $stmtBurial->bind_param(
                "iiisssssssss",
                $userId, $lotId, $reservationId, $deceasedName, $burialDate, $area,
                $block, $rowNumber, $lotNumber, $deceasedValidId, $deathCertificate, $burialPermit
            );
            $stmtBurial->execute();
            $stmtBurial->close();
        }
    }

    echo json_encode(["status" => "success", "message" => "Reservation submitted successfully"]);
    exit;
}

$conn->close();