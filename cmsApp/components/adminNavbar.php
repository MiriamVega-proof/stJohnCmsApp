<?php
/**
 * Admin Navbar Component
 * 
 * This component provides a consistent navigation bar for all admin pages.
 * It includes authentication checks and proper role-based navigation.
 * 
 * Requirements:
 * - Session must be started before including this component
 * - auth_helper.php must be included
 * - Bootstrap CSS and JS must be loaded
 * - Font Awesome icons must be loaded
 * 
 * Usage:
 * <?php include '../../../components/adminNavbar.php'; ?>
 * 
 * @param string $activePage - The current page identifier for highlighting active nav items
 */

// Ensure user is authenticated and has proper role
if (!function_exists('getCurrentUserName')) {
    die('Authentication helper not loaded. Please include auth_helper.php before this component.');
}

// Get current user information
$userId = getCurrentUserId();
$userName = getCurrentUserName();
$userRole = getCurrentUserRole();

// Set default active page if not provided
if (!isset($activePage)) {
    $activePage = '';
}

// Define navigation items with their corresponding identifiers
$navItems = [
    'dashboard' => [
        'label' => 'Home',
        'url' => '../adminDashboard/adminDashboard.php',
        'icon' => 'fas fa-home'
    ]
];

$managementDropdown = [
    'appointments' => [
        'label' => 'Appointment Management',
        'url' => '../adminAppointment/adminAppointment.php',
        'icon' => 'fas fa-calendar-check'
    ],
    'cemetery' => [
        'label' => 'Cemetery Map Management',
        'url' => '../adminCemeteryMap/adminCemeteryMap.php',
        'icon' => 'fas fa-map'
    ],
    'reservations' => [
        'label' => 'Lot Reservation Management',
        'url' => '../adminReservation/adminReservation.php',
        'icon' => 'fas fa-file-contract'
    ],
    'burials' => [
        'label' => 'Burial Record Management',
        'url' => '../adminBurial/adminBurial.php',
        'icon' => 'fas fa-book'
    ],
    'financial' => [
        'label' => 'Financial Tracking',
        'url' => '../adminFinancial/adminFinancial.php',
        'icon' => 'fas fa-dollar-sign'
    ],
    'maintenance' => [
        'label' => 'Maintenance Management',
        'url' => '../adminMaintenance/adminMaintenance.php',
        'icon' => 'fas fa-tools'
    ]
];

$adminToolsDropdown = [
    'audit' => [
        'label' => 'Audit Logs',
        'url' => '../adminAuditLogs/adminAuditLogs.php',
        'icon' => 'fas fa-history'
    ],
    'users' => [
        'label' => 'User Management',
        'url' => '../adminUserManagement/adminUserManagement.php',
        'icon' => 'fas fa-users'
    ],
    'reports' => [
        'label' => 'Reports Module',
        'url' => '../adminReports/adminReports.php',
        'icon' => 'fas fa-chart-bar'
    ]
];
?>

<!-- Admin Navigation Bar -->
<nav class="navbar navbar-expand-lg navbar-dark fixed-top admin-navbar">
    <div class="container-fluid">
        <!-- Brand -->
        <a class="navbar-brand d-flex align-items-center" href="../adminDashboard/adminDashboard.php">
            <i class="fas fa-cross me-2"></i>
            <span class="brand-text">
                <span class="d-none d-md-inline">Blessed Saint John Memorial</span>
                <span class="d-md-none">BSJ Memorial</span>
            </span>
        </a>

        <!-- Mobile Toggle Button -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar" 
                aria-controls="adminNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation Content -->
        <div class="collapse navbar-collapse" id="adminNavbar">
            <!-- Main Navigation -->
            <ul class="navbar-nav mx-auto">
                <!-- Dashboard/Home -->
                <li class="nav-item">
                    <a class="nav-link <?php echo ($activePage === 'dashboard') ? 'active' : ''; ?>" 
                       href="../adminDashboard/adminDashboard.php">
                        <i class="fas fa-home me-1"></i>
                        <span>Dashboard</span>
                    </a>
                </li>

                <!-- Management Dropdown -->
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle <?php echo (in_array($activePage, array_keys($managementDropdown))) ? 'active' : ''; ?>" 
                       href="#" id="managementDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-cogs me-1"></i>
                        <span>Management</span>
                    </a>
                    <ul class="dropdown-menu admin-dropdown" aria-labelledby="managementDropdown">
                        <?php foreach ($managementDropdown as $key => $item): ?>
                        <li>
                            <a class="dropdown-item <?php echo ($activePage === $key) ? 'active' : ''; ?>" 
                               href="<?php echo $item['url']; ?>">
                                <i class="<?php echo $item['icon']; ?> me-2"></i>
                                <?php echo $item['label']; ?>
                            </a>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                </li>

                <!-- Admin Tools Dropdown -->
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle <?php echo (in_array($activePage, array_keys($adminToolsDropdown))) ? 'active' : ''; ?>" 
                       href="#" id="adminToolsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-tools me-1"></i>
                        <span>Admin Tools</span>
                    </a>
                    <ul class="dropdown-menu admin-dropdown" aria-labelledby="adminToolsDropdown">
                        <?php foreach ($adminToolsDropdown as $key => $item): ?>
                        <li>
                            <a class="dropdown-item <?php echo ($activePage === $key) ? 'active' : ''; ?>" 
                               href="<?php echo $item['url']; ?>">
                                <i class="<?php echo $item['icon']; ?> me-2"></i>
                                <?php echo $item['label']; ?>
                            </a>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                </li>
            </ul>

            <!-- Mobile User Section -->
            <div class="d-lg-none mt-3 pt-3 border-top">
                <div class="d-flex align-items-center mb-3">
                    <div class="user-avatar me-3">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-info">
                        <div class="user-name"><?php echo htmlspecialchars($userName); ?></div>
                        <div class="user-role"><?php echo ucfirst(htmlspecialchars($userRole)); ?></div>
                    </div>
                </div>
                <a href="../../../../cms.api/logout.php" class="btn btn-outline-light btn-sm w-100">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
            </div>

            <!-- Desktop User Dropdown -->
            <div class="dropdown d-none d-lg-block">
                <a class="nav-link dropdown-toggle user-dropdown" href="#" id="userDropdown" 
                   role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-info text-start">
                            <div class="user-name"><?php echo htmlspecialchars($userName); ?></div>
                            <div class="user-role"><?php echo ucfirst(htmlspecialchars($userRole)); ?></div>
                        </div>
                    </div>
                </a>
                <ul class="dropdown-menu dropdown-menu-end admin-dropdown" aria-labelledby="userDropdown">
                    <li>
                        <div class="dropdown-item-text">
                            <div class="fw-bold"><?php echo htmlspecialchars($userName); ?></div>
                            <small class="text-muted"><?php echo ucfirst(htmlspecialchars($userRole)); ?></small>
                        </div>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item" href="../../../../cms.api/logout.php">
                            <i class="fas fa-sign-out-alt me-2"></i>Logout
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</nav>

<!-- Add some top padding to body content to account for fixed navbar -->
<style>
body {
    padding-top: 76px; /* Adjust based on navbar height */
}
</style>