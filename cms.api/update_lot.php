<?php
session_start();
header("Content-Type: application/json");
require "db_connect.php";

// Check login and retrieve the current user's ID
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized: User not logged in."]);
    exit;
}
// Store the authenticated user's ID
$sessionUserId = (int)$_SESSION['user_id']; 

// Decode JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['lotId'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "lotId is required"]);
    exit;
}

// Sanitize inputs
$lotId      = (int)($data['lotId']);
$block      = trim($data['block'] ?? '');
$area       = trim($data['area'] ?? '');
$rowNumber  = trim($data['rowNumber'] ?? '');
$lotNumber  = trim($data['lotNumber'] ?? '');
$lotTypeId  = isset($data['lotTypeId']) ? (int)$data['lotTypeId'] : null;
$buryDepth  = trim($data['buryDepth'] ?? '');
$status     = trim($data['status'] ?? 'Available');

// 🛑 CRITICAL FIX: Overwrite the $userId from the payload with the authenticated session ID
// When the status is "Pending" (meaning a new reservation), we MUST link the lot to the user.
// In all other cases (e.g., status is 'Available' and client wants to clear the link), 
// we still use the authenticated user ID unless explicitly sending null.
// Since the JS sends 'userId: null', we will enforce the use of the session ID here.
$userId = $sessionUserId;

$allowedStatuses = ['Available','Pending','Reserved','Occupied'];
if (!in_array($status, $allowedStatuses)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid status"]);
    exit;
}

try {
    $sql = "UPDATE lots SET 
        userId = ?, block = ?, area = ?, rowNumber = ?, lotNumber = ?, 
        lotTypeId = ?, buryDepth = ?, status = ?, updatedAt = NOW()
        WHERE lotId = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception($conn->error);

    // Now, $userId is guaranteed to be an integer (the $sessionUserId),
    // so we can use the integer binding without the complicated NULL handling logic.
    // The binding types are "issssissi" (i=userId, s=block, s=area, s=row, s=lot, i=lotTypeId, s=depth, s=status, i=lotId)
    $stmt->bind_param(
        "issssissi",
        $userId, // Now uses $sessionUserId
        $block,
        $area,
        $rowNumber,
        $lotNumber,
        $lotTypeId,
        $buryDepth,
        $status,
        $lotId
    );

    if ($stmt->execute()) {
        if ($stmt->affected_rows >= 0) {
            echo json_encode([
                "success" => true,
                "message" => "Lot updated successfully",
                "lotId" => $lotId
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "No rows updated"
            ]);
        }
    } else {
        echo json_encode(["success" => false, "message" => $stmt->error]);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Exception: " . $e->getMessage()]);
} finally {
    $conn->close();
}
// NOTE: Your original PHP had complex logic to bind NULL for userId.
// Since we are now using the authenticated user's ID, that complex logic is no longer needed
// and has been replaced by the simpler, correct integer binding ("i") for the userId field.
?>