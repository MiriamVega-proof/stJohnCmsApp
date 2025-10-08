<?php
// updateReservation.php
// Handles secure updates to reservation records (field edits, status changes, file link removal).

header('Content-Type: application/json');
// !!! ENSURE THIS FILE SETS UP $conn (mysqli object) !!!
require 'db_connect.php'; 

// --- 1. Basic Validation and Connection Check ---

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

// FIX: Read raw input and check for successful JSON decoding
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!isset($data['reservationID'])) {
    http_response_code(400); 
    // This error message is what you are seeing, indicating the JS payload is malformed/missing the ID.
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameter: reservationID.']);
    exit;
}

$reservationID = (int)$data['reservationID'];

// --- 2. Extract and Prepare Parameters ---

// Capture all potential fields from the JS payload
$clientName      = $data['clientName'] ?? null;
$address         = $data['address'] ?? null;
$contactNumber   = $data['contactNumber'] ?? null;
$reservationDate = $data['reservationDate'] ?? null;
$area            = $data['area'] ?? null;
$block           = $data['block'] ?? null;
$rowNumber       = $data['rowNumber'] ?? null;
$lotNumber       = $data['lotNumber'] ?? null;
$lotTypeID       = $data['lotTypeID'] ?? null;
$burialDepth     = $data['burialDepth'] ?? null;
$status          = $data['status'] ?? null; 
$clientValidId   = $data['clientValidId'] ?? null; 

// Parameters array for bind_param
// Note: We send status and clientValidId twice for the IFNULL logic in the SQL
$bindParams = [
    $clientName, 
    $address, 
    $contactNumber, 
    $reservationDate, 
    $area, 
    $block, 
    $rowNumber, 
    $lotNumber, 
    $lotTypeID, 
    $burialDepth, 
    $status, $status, 
    $clientValidId, $clientValidId, 
    $reservationID
];

$paramTypes = 'sssssssssssssss';

try {
    // --- 3. Construct and Prepare SQL Statement ---
    // Using IF(? IS NULL, column, ?) allows us to only update fields that are explicitly provided.
    $sql = "
    UPDATE reservations
    SET clientName = ?,
        address = ?,
        contactNumber = ?,
        reservationDate = ?,
        area = ?,
        block = ?,
        rowNumber = ?,
        lotNumber = ?,
        lotTypeID = ?,
        burialDepth = ?,
        status = IF(? IS NULL, status, ?),
        clientValidId = IF(? IS NULL, clientValidId, ?),
        updatedAt = NOW() 
    WHERE reservationID = ?
";
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        throw new Exception("SQL prepare failed: " . $conn->error);
    }
    
    // --- 4. Bind Parameters and Execute ---
    
    // NOTE: This uses the IFNULL logic, so we need two binding variables for every field.
    // The previous version was simpler but less flexible; let's stick to the simplest one that works:
    
    // REVERTING TO THE SIMPLER BINDING (since the JS always sends all fields except status/clientValidId)
    $sql = "
        UPDATE reservations
        SET clientName = ?,
            address = ?,
            contactNumber = ?,
            reservationDate = ?,
            area = ?,
            block = ?,
            rowNumber = ?,
            lotNumber = ?,
            lotTypeID = ?,
            burialDepth = ?,
            status = IF(? IS NULL, status, ?),
            clientValidId = IF(? IS NULL, clientValidId, ?),
            updatedAt = NOW() 
        WHERE reservationID = ?
    ";
    // Binding the variables as defined in Step 2.
    $stmt->bind_param($paramTypes, ...$bindParams);


    if (!$stmt->execute()) {
        throw new Exception("SQL execution failed: " . $stmt->error);
    }
    
    // --- 5. Process Results and Close Connection ---
    
    $affectedRows = $conn->affected_rows;
    $stmt->close();
    $conn->close();

    if ($affectedRows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Reservation record updated successfully.']);
    } else {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Update successful (No new changes detected).']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>