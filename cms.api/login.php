<?php
// Enable error reporting (remove on production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start session first
session_start();

// Include DB connection
require 'db_connect.php';

// Always return JSON
header('Content-Type: application/json');

// Allow only POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($email) || empty($password)) {
        echo json_encode([
            "status" => "error",
            "message" => "Please fill in all fields"
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT userId, firstName, lastName, email, password, role FROM user WHERE email = ?");
    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => "Database error"
        ]);
        exit;
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // ⚠️ Use password_verify if hashed passwords
        if ($password === $row['password']) {
            $_SESSION['user_id'] = $row['userId'];
            $_SESSION['firstName'] = $row['firstName'];
            $_SESSION['lastName'] = $row['lastName'];
            $_SESSION['name'] = $row['firstName'] . " " . $row['lastName']; // ✅ Full name
            $_SESSION['role'] = $row['role'];

            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "role" => $row['role'],
                "fullName" => $_SESSION['name']
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Incorrect password"
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Account not found"
        ]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request method"
    ]);
}
?>
