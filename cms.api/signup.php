<?php
include("db_connect.php"); // adjust filename if needed

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $firstName = mysqli_real_escape_string($conn, $_POST['firstName']);
    $lastName = mysqli_real_escape_string($conn, $_POST['lastName']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $contactNumber = mysqli_real_escape_string($conn, $_POST['contactNumber']);
    $password = mysqli_real_escape_string($conn, $_POST['password']); // now saving raw password
    $emergencyContactName = mysqli_real_escape_string($conn, $_POST['emergencyContactName']);
    $emergencyContactNumber = mysqli_real_escape_string($conn, $_POST['emergencyContactNumber']);
    $role = "Client"; // default role

    // check if email already exists
    $checkEmail = "SELECT * FROM user WHERE email='$email'";
    $result = $conn->query($checkEmail);

    if ($result->num_rows > 0) {
        echo "Email Address Already Exists!";
        exit;
    }

    // insert user with plain password
    $insertQuery = "INSERT INTO user 
        (firstName, lastName, email, contactNumber, password, role, emergencyContactName, emergencyContactNumber, createdAt) 
        VALUES 
        ('$firstName', '$lastName', '$email', '$contactNumber', '$password', '$role', '$emergencyContactName', '$emergencyContactNumber', NOW())";

    if ($conn->query($insertQuery) === TRUE) {
        echo '<div class="alert alert-info" role="alert">
                Registration successful! Redirecting to login page...
              </div>';
        echo '<script>
                setTimeout(function() {
                    window.location.href = "../cmsApp/frontend/auth/login/login.php";
                }, 8000);
              </script>';
    } else {
        echo "Error: " . $conn->error;
    }
}
?>
