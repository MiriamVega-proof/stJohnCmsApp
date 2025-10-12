# Admin Navbar Component Implementation Guide

## Overview
The Admin Navbar Component provides a consistent, professional navigation bar for all admin pages in the Blessed Saint John Memorial CMS system.

## Features
- **Consistent Design**: Modern dark theme with gold accents matching the system branding
- **Font System**: Uses Inter for body text and Playfair Display for headings
- **Responsive Design**: Adapts perfectly to mobile, tablet, and desktop screens
- **Role-Based Navigation**: Automatically shows appropriate menu items based on user role
- **Active Page Highlighting**: Shows current page/section clearly
- **Professional User Interface**: Clean dropdowns and user management section

## Implementation

### 1. Include Required Files

Add to your admin page `<head>` section:

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<!-- Component Styles -->
<link rel="stylesheet" href="../../components/adminNavbar.css">
```

### 2. Set Active Page Variable

Before the `<!DOCTYPE html>` declaration, set the active page:

```php
<?php
// ... your authentication code ...

// Set active page for navbar highlighting
$activePage = 'dashboard'; // or 'reservations', 'appointments', etc.
?>
```

### 3. Include the Navbar Component

Replace your existing navbar with:

```php
<body>
    <!-- Include Admin Navbar Component -->
    <?php include '../../components/adminNavbar.php'; ?>
    
    <!-- Your page content here -->
```

## Active Page Values

Use these values for `$activePage` to highlight the correct navigation item:

- `'dashboard'` - Admin Dashboard
- `'appointments'` - Appointment Management
- `'cemetery'` - Cemetery Map Management  
- `'reservations'` - Lot Reservation Management
- `'burials'` - Burial Record Management
- `'financial'` - Financial Tracking
- `'maintenance'` - Maintenance Management
- `'audit'` - Audit Logs
- `'users'` - User Management
- `'reports'` - Reports Module

## CSS Integration

Update your page CSS to use the new font system:

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: 0.02em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Brand font for headings */
h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', serif;
}
```

## Benefits

1. **Consistency**: All admin pages will have identical navigation
2. **Maintainability**: Changes to navbar only need to be made in one place
3. **Professional Appearance**: Modern design with proper typography
4. **User Experience**: Clear navigation with active states and hover effects
5. **Responsive**: Works perfectly on all device sizes
6. **Accessibility**: Proper focus states and keyboard navigation

## Updated Pages

Currently implemented on:
- ✅ Admin Dashboard (`adminDashboard.php`)
- ✅ Admin Reservation (`adminReservation.php`)

## To Do

Apply to remaining admin pages:
- [ ] Admin Appointment (`adminAppointment.php`)
- [ ] Admin Cemetery Map (`adminCemeteryMap.php`) 
- [ ] Admin Burial (`adminBurial.php`)
- [ ] Admin Financial (`adminFinancial.php`)
- [ ] Admin Maintenance (`adminMaintenance.php`)
- [ ] Admin Audit Logs (`adminAuditLogs.php`)
- [ ] Admin User Management (`adminUserManagement.php`)
- [ ] Admin Reports (`adminReports.php`)

## Support

If you need help implementing this component, refer to the examples in:
- `adminDashboard.php` - Basic implementation
- `adminReservation.php` - Implementation with active page highlighting