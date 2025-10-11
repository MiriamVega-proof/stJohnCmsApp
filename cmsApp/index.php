<?php
session_start();

// Check if user is logged in
if (isset($_SESSION['user_id']) && isset($_SESSION['role'])) {
    // User is logged in, redirect based on their role
    $role = $_SESSION['role'];
    
    switch ($role) {
        case 'Admin':
            header("Location: frontend/admin/adminDashboard/adminDashboard.php");
            exit();
        case 'Secretary':
            // Assuming secretary dashboard exists or redirect to admin
            header("Location: frontend/admin/adminDashboard/adminDashboard.php");
            exit();
        case 'Client':
            header("Location: frontend/client/clientDashboard/clientDashboard.php");
            exit();
        default:
            // Unknown role, destroy session and redirect to login
            session_destroy();
            header("Location: frontend/auth/login/login.php");
            exit();
    }
} else {
    // User is not logged in, redirect to login page
    header("Location: frontend/auth/login/login.php");
    exit();
}
?>