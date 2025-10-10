<?php
require_once "db_connect.php";
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'POST':
            // Create new user
            createUser($conn, $input);
            break;
        case 'PUT':
            // Update existing user
            updateUser($conn, $input);
            break;
        case 'DELETE':
            // Delete user (requires user ID in query params)
            $userId = $_GET['userId'] ?? null;
            if (!$userId) {
                throw new Exception('User ID is required for deletion');
            }
            deleteUser($conn, $userId);
            break;
        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function createUser($conn, $data) {
    // Validate required fields
    $requiredFields = ['firstName', 'lastName', 'email', 'role'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }

    // Check if email already exists
    $checkEmailSql = "SELECT COUNT(*) as count FROM user WHERE email = ?";
    $checkStmt = $conn->prepare($checkEmailSql);
    $checkStmt->bind_param('s', $data['email']);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $emailExists = $result->fetch_assoc()['count'] > 0;
    
    if ($emailExists) {
        throw new Exception('An account with this email already exists');
    }
    
    // Hash password if provided
    $hashedPassword = null;
    if (!empty($data['password'])) {
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    
    // Prepare variables for bind_param (null coalescing creates temp values)
    $contactNumber = $data['contactNumber'] ?? '';
    $emergencyContactName = $data['emergencyContactName'] ?? '';
    $emergencyContactNumber = $data['emergencyContactNumber'] ?? '';
    
    // Insert new user
    $sql = "INSERT INTO user (firstName, lastName, email, contactNumber, role, 
            emergencyContactName, emergencyContactNumber, password, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssssssss',
        $data['firstName'],
        $data['lastName'],
        $data['email'],
        $contactNumber,
        $data['role'],
        $emergencyContactName,
        $emergencyContactNumber,
        $hashedPassword
    );
    
    if ($stmt->execute()) {
        $userId = $conn->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'userId' => $userId
        ]);
    } else {
        throw new Exception('Failed to create user: ' . $stmt->error);
    }
    
    $stmt->close();
    $checkStmt->close();
}

function updateUser($conn, $data) {
    // Validate required fields
    if (empty($data['userId'])) {
        throw new Exception('User ID is required for update');
    }
    
    $userId = $data['userId'];
    
    // Check if user exists
    $checkUserSql = "SELECT COUNT(*) as count FROM user WHERE userId = ?";
    $checkStmt = $conn->prepare($checkUserSql);
    $checkStmt->bind_param('i', $userId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $userExists = $result->fetch_assoc()['count'] > 0;
    
    if (!$userExists) {
        throw new Exception('User not found');
    }
    
    // Check if email already exists for other users
    if (!empty($data['email'])) {
        $checkEmailSql = "SELECT COUNT(*) as count FROM user WHERE email = ? AND userId != ?";
        $emailStmt = $conn->prepare($checkEmailSql);
        $emailStmt->bind_param('si', $data['email'], $userId);
        $emailStmt->execute();
        $result = $emailStmt->get_result();
        $emailExists = $result->fetch_assoc()['count'] > 0;
        
        if ($emailExists) {
            throw new Exception('An account with this email already exists');
        }
        $emailStmt->close();
    }
    
    // Build dynamic update query
    $updateFields = [];
    $types = '';
    $values = [];
    
    $allowedFields = ['firstName', 'lastName', 'email', 'contactNumber', 'role', 
                     'emergencyContactName', 'emergencyContactNumber'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateFields[] = "$field = ?";
            $types .= 's';
            $values[] = $data[$field];
        }
    }
    
    if (empty($updateFields)) {
        throw new Exception('No fields to update');
    }
    
    // Always update the updatedAt timestamp
    $updateFields[] = "updatedAt = NOW()";
    
    $sql = "UPDATE user SET " . implode(', ', $updateFields) . " WHERE userId = ?";
    $types .= 'i';
    $values[] = $userId;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully',
                'userId' => $userId
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'No changes made',
                'userId' => $userId
            ]);
        }
    } else {
        throw new Exception('Failed to update user: ' . $stmt->error);
    }
    
    $stmt->close();
    $checkStmt->close();
}

function deleteUser($conn, $userId) {
    // Check if user exists
    $checkUserSql = "SELECT COUNT(*) as count FROM user WHERE userId = ?";
    $checkStmt = $conn->prepare($checkUserSql);
    $checkStmt->bind_param('i', $userId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $userExists = $result->fetch_assoc()['count'] > 0;
    
    if (!$userExists) {
        throw new Exception('User not found');
    }
    
    // Delete user
    $sql = "DELETE FROM user WHERE userId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $userId);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully',
                'userId' => $userId
            ]);
        } else {
            throw new Exception('User not found or already deleted');
        }
    } else {
        throw new Exception('Failed to delete user: ' . $stmt->error);
    }
    
    $stmt->close();
    $checkStmt->close();
}

$conn->close();
?>
