<?php
// getDocument.php
session_start();
require_once "db_connect.php";

// === Helper: Safe logger ===
function logError($message) {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    $logFile = $logDir . '/document_errors.log';
    $timestamp = date("Y-m-d H:i:s");
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

// === 1. Authentication check ===
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    logError("Unauthorized access attempt.");
    die("Error: User not logged in.");
}

// === 2. Validate parameters ===
if (!isset($_GET['doc'])) {
    http_response_code(400);
    logError("Missing document type parameter.");
    die("Error: Missing document type parameter.");
}

$userId        = $_SESSION['user_id'];
$reservationId = isset($_GET['id']) ? intval($_GET['id']) : 0;
$docType       = $_GET['doc'];

// === 3. Allowed document fields ===
$allowedDocs = [
    "valid_id"      => "deceasedValidId",
    "death_cert"    => "deathCertificate",
    "burial_permit" => "burialPermit"
];

if (!array_key_exists($docType, $allowedDocs)) {
    http_response_code(400);
    logError("Invalid document type requested: $docType by user $userId");
    die("Error: Invalid document type.");
}

$column = $allowedDocs[$docType];

// === 4. Fetch file path ===
// === 4. Fetch file path (specific to reservation and user) ===
$sql = "SELECT $column FROM reservations WHERE reservationId = ? AND userId = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $reservationId, $userId);
$stmt->execute();
$stmt->bind_result($filePath);
$stmt->fetch();
$stmt->close();

$stmt->execute();
$stmt->bind_result($filePath);
$stmt->fetch();
$stmt->close();

// === 5. Validate & normalize file path ===
if (!$filePath) {
    http_response_code(404);
    logError("No file path found for user $userId, reservation $reservationId, type $docType.");
    die("Error: File not found.");
}

$filePath = trim(str_replace(["\\", "//"], "/", $filePath));

// === 6. Detect possible paths ===
$possiblePaths = [
    $filePath,
    __DIR__ . "/" . $filePath,
    __DIR__ . "/uploads/" . basename($filePath),
    dirname(__DIR__) . "/uploads/" . basename($filePath)
];

$foundPath = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $foundPath = $path;
        break;
    }
}

if (!$foundPath) {
    http_response_code(404);
    logError("File missing for user $userId, reservation $reservationId, doc $docType. Checked: " . json_encode($possiblePaths));
    die("Error: File not found or missing.");
}

// === 7. Send file with proper headers ===
$ext = strtolower(pathinfo($foundPath, PATHINFO_EXTENSION));
switch ($ext) {
    case "pdf":
        header("Content-Type: application/pdf");
        header("Content-Disposition: inline; filename=\"" . basename($foundPath) . "\"");
        break;
    case "jpg":
    case "jpeg":
        header("Content-Type: image/jpeg");
        header("Content-Disposition: inline; filename=\"" . basename($foundPath) . "\"");
        break;
    case "png":
        header("Content-Type: image/png");
        header("Content-Disposition: inline; filename=\"" . basename($foundPath) . "\"");
        break;
    default:
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"" . basename($foundPath) . "\"");
}

header("Content-Length: " . filesize($foundPath));
readfile($foundPath);
exit;
?>
