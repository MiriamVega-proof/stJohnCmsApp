<?php
require_once "cms.api/db_connect.php";

// Simple test to see what's in the maintenancerequest table
$sql = "SELECT * FROM maintenancerequest LIMIT 5";
$result = $conn->query($sql);

if ($result) {
    echo "Found " . $result->num_rows . " maintenance requests\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['requestId'] . ", Status: " . $row['status'] . ", Service: " . $row['serviceType'] . "\n";
    }
} else {
    echo "Error: " . $conn->error . "\n";
}

// Test counting by status
$sql2 = "SELECT status, COUNT(*) as count FROM maintenancerequest GROUP BY status";
$result2 = $conn->query($sql2);

if ($result2) {
    echo "\nStatus counts:\n";
    while ($row = $result2->fetch_assoc()) {
        echo $row['status'] . ": " . $row['count'] . "\n";
    }
} else {
    echo "Error counting: " . $conn->error . "\n";
}

$conn->close();
?>