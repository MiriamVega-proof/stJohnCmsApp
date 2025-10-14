<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id']) || !isset($_SESSION['email'])) {
    // User is not logged in, redirect to login page
    header("Location: ../../auth/login/login.php");
    exit();
}

// Optional: You can also check user role if needed
// if ($_SESSION['role'] !== 'client') {
//     header("Location: ../../auth/login/login.php");
//     exit();
// }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1,user-scalable=no,maximum-scale=1,width=device-width">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">

    <title>Cemetery Map Management</title>

    <link rel="stylesheet" href="./resources/ol.css">
    <link rel="stylesheet" href="resources/fontawesome-all.min.css">
    <link href="resources/photon-geocoder-autocomplete.min.css" rel="stylesheet">
    <link rel="stylesheet" href="./resources/ol-layerswitcher.css">
    <link rel="stylesheet" href="./resources/qgis2web.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="cemeteryMap.css">
</head>
<body class="bg-light">

  <nav class="navbar navbar-expand-lg fixed-top shadow-sm" aria-label="Main navigation">
        <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center gap-2" href="#" aria-label="Blessed Saint John Memorial Home">
                <span class="fw-bold">Blessed Saint John Memorial</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" tabindex="0">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mx-auto mb-2 mb-lg-0" role="menubar">
                    <li class="nav-item"><a class="nav-link" href="../clientDashboard/clientDashboard.php" role="menuitem" tabindex="0">Home</a></li>
                    <li class="nav-item"><a class="nav-link active" aria-current="page" href="cemeteryMap.php" role="menuitem" tabindex="0">Cemetery Map</a></li>
                    <li class="nav-item"><a class="nav-link" href="../lotReservation/lotReservation.php" role="menuitem" tabindex="0">Lot Reservation</a></li>
                    <li class="nav-item"><a class="nav-link" href="../payment/payment.php" role="menuitem" tabindex="0">Payment</a></li>
                    <li class="nav-item"><a class="nav-link" href="../burialRecord/burialRecord.php" role="menuitem" tabindex="0">Burial Record</a></li>
                    <li class="nav-item"><a class="nav-link" href="../maintenanceServiceRequest/maintenanceServiceRequest.php" role="menuitem" tabindex="0">Maintenance Request</a></li>
                </ul>
    
                <div class="d-lg-none mt-3 pt-3 border-top border-dark-subtle">
                    <div class="d-flex align-items-center mb-2">
                        <span id="user-name-display-mobile" class="fw-bold">Maria Anjelika Erese</span>
                    </div>
                    <a href="../../../../cms.api/logout.php" id="logoutLinkMobile" class="mobile-logout-link">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </a>
                </div>
            </div>
            
            <div class="dropdown d-none d-lg-block">
                <a href="#" class="nav-link dropdown-toggle d-flex align-items-center" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span id="user-name-display-desktop">User Name</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="../../../../cms.api/logout.php" id="logoutLinkDesktop">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </a></li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="main-content">
      <div class="page-header">
  <h1 id="main-title">Cemetery Map Management</h1>
        <p>Manage and view lot statuses on the interactive map.</p>
      </div>
      
      <div class="map-section">
  <div class="map-legend-container" aria-label="Map legend">
          <h4>Legend:</h4>
          <ul role="list">
            <li><span class="legend-color available" aria-label="Available"></span> Available</li><li><span class="legend-color pending" aria-label="Pending"></span> Pending</li><li><span class="legend-color reserved" aria-label="Reserved"></span> Reserved</li><li><span class="legend-color occupied" aria-label="Occupied"></span> Occupied</li>
          </ul>
        </div>

        <div class="map-container-wrapper">
          <div class="map-placeholder" id="cemeteryMap" aria-label="Cemetery Map" tabindex="0">
            <div id="map">
              <div id="popup" class="ol-popup">
                <a href="#" id="popup-closer" class="ol-popup-closer"></a>
                <div id="popup-content"></div>
              </div>
            </div>
            <button id="expandMapBtn" class="expand-btn" aria-label="Expand or collapse map" tabindex="0"><i class="fas fa-expand"></i> Expand Map</button>
          </div>

          <div class="lot-actions-panel">
            <h3>Lot Management</h3>

            <div class="lot-list-header">
              <h4>Existing Lots</h4>
              <input type="text" id="lotSearch" placeholder="Search by Lot ID, Block, Area..." aria-label="Search lots" tabindex="0">
            </div>
            
            <div id="lotList" class="lot-list" aria-live="polite"></div>
            <div class="pagination-controls">
              <button id="prevPageBtn" class="pagination-btn" aria-label="Previous page" tabindex="0">&laquo; Previous</button>
              <span id="pageInfo">Page 1 of 1</span>
              <button id="nextPageBtn" class="pagination-btn" aria-label="Next page" tabindex="0">Next &raquo;</button>
            </div>
            <p class="note"><strong>Note:</strong> All status changes are verified and reflected system-wide across dashboards.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- EDIT LOT MODAL -->
  <div id="editLotModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="editLotTitle">
      <div class="modal-content">
        <span class="close-button">&times;</span>
  <h2 id="editLotTitle">Lot Details</h2>
        <form id="editLotForm">
          <label for="editLotId">Lot ID</label>
          <input type="text" id="editLotId" name="lotId" readonly tabindex="0">

          <label for="editBlock">Block</label>
          <input type="text" id="editBlock" required readonly tabindex="0">
          
          <label for="editArea">Area</label>
          <input type="text" id="editArea" required readonly tabindex="0">

          <label for="editRowNum">Row Number</label>
          <input type="text" id="editRowNumber" name="rowNumber" readonly tabindex="0">

          <label for="editLotNum">Lot Number</label>
          <input type="text" id="editLotNumber" name="lotNumber" readonly tabindex="0">

          <label for="editLotType">Type</label>
          <select id="editLotType" required tabindex="0">
            <option value="1">Regular Lot (₱50,000)</option>
            <option value="2">Regular Lot (₱60,000)</option>
            <option value="3">Premium Lot (₱70,000)</option>
            <option value="4">Mausoleum Inside (₱500,000)</option>
            <option value="5">Mausoleum Roadside (₱600,000)</option>
            <option value="6">4-Lot Package (₱300,000)</option>
            <option value="7">Exhumation (₱15,000)</option>
          </select>

          <label for="editDepth">Burial Depth</label>
          <select id="editDepth" required tabindex="0">
            <option value="4ft">4ft</option>
            <option value="6ft">6ft</option>
          </select>

          <label for="editStatus">Status</label>
          <input id="editStatus" readonly tabindex="0">

          <input type="hidden" id="editGeo" name="geo">

          <button type="submit" class="btn btn-update">Reserve Now</button>
        </form>
      </div>
    </div>

    <footer class="footer text-center py-3">
        <div class="container d-flex flex-column flex-md-row justify-content-center align-items-center">
            <p class="m-0">
                <strong>Blessed Saint John Memorial</strong> |
                <i class="fas fa-envelope"></i> <a href="mailto:saintjohnmp123@gmail.com">saintjohnmp123@gmail.com</a> |
                <i class="fas fa-phone"></i> <a href="tel:+639978442421">+63 997 844 2421</a>
            </p>
        </div>
    </footer>

  <script src="resources/qgis2web_expressions.js" defer></script>
  <script src="./resources/functions.js" defer></script>
  <script src="./resources/ol.js" defer></script>
  <script src="./resources/ol-layerswitcher.js" defer></script>
  <script src="resources/photon-geocoder-autocomplete.min.js" defer></script>
  <script src="layers/nondescriptbuildings_1.js" defer></script>
  <script src="layers/geo_2.js" defer></script>
  <script src="styles/nondescriptbuildings_1_style.js" defer></script>
  <script src="styles/geo_2_style.js" defer></script>
  <script src="./layers/layers.js" type="text/javascript" defer></script> 
  <script src="./resources/Autolinker.min.js" defer></script>
  <script src="./resources/qgis2web.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js" defer></script>
  <script src="cemeteryMap.js" defer></script>
  </body>
</html>