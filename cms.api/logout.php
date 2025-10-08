<?php
session_start();
session_destroy(); // ✅ Destroy session
echo json_encode(["status" => "success", "message" => "Logged out successfully"]);
exit;
?>
