<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cemetery Map - Blessed Saint John Memorial</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="cemeteryMap.css">
</head>
<body class="bg-light">

    <nav class="navbar navbar-expand-lg fixed-top shadow-sm">
        <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center gap-2" href="#">
                <span class="fw-bold">Blessed Saint John Memorial</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="../clientDashboard/clientDashboard.php">Home</a></li>
                    <li class="nav-item"><a class="nav-link active" aria-current="page" href="cemeteryMap.php">Cemetery Map</a></li>
                    <li class="nav-item"><a class="nav-link" href="../lotReservation/lotReservation.php">Lot Reservation</a></li>
                    <li class="nav-item"><a class="nav-link" href="../payment/payment.php">Payment</a></li>
                    <li class="nav-item"><a class="nav-link" href="../burialRecord/burialRecord.php">Burial Record</a></li>
                    <li class="nav-item"><a class="nav-link" href="../maintenanceServiceRequest/maintenanceServiceRequest.php">Maintenance Request</a></li>
                </ul>
    
                <div class="d-lg-none mt-3 pt-3 border-top border-dark-subtle">
                    <div class="d-flex align-items-center mb-2">
                        <span id="user-name-display-mobile" class="fw-bold">Maria Anjelika Erese</span>
                    </div>
                    <a href=".././auth/login.php" id="logoutLinkMobile" class="mobile-logout-link">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </a>
                </div>
            </div>
            
            <div class="dropdown d-none d-lg-block">
                <a href="#" class="nav-link dropdown-toggle d-flex align-items-center" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="user-initials me-2" id="user-initials-desktop">MA</span>
                    <span id="user-name-display-desktop">Maria Anjelika Erese</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href=".././auth/login.php" id="logoutLinkDesktop">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </a></li>
                </ul>
            </div>
        </div>
    </nav>
    <main class="container py-5">
        <div class="row pt-4">
            <div class="col-12">
                <h1 class="mb-1 fw-bold text-dark">Cemetery Map</h1>
                <p class="text-muted">Click any lot on the map to view its status and details. Use the zoom button for a larger view.</p>
                <hr class="mb-4">
            </div>
        </div>

        <div class="row mb-4 g-3">
            <div class="col-lg-8">
                <div class="card p-3 shadow-sm border-0 h-100">
                    <h4 class="card-title fs-5 mb-2 fw-semibold"><i class="fas fa-search-location me-2"></i> Lot Availability Instructions:</h4>
                    <p class="mb-0">
                        Use the interactive map area below. **Click on a specific lot** to check its current status. 
                        Only **Green (Available)** lots can be reserved. When you click an available lot, its detailed information will automatically populate on the right panel.
                    </p>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card p-3 shadow-sm border-0 h-100">
                    <h4 class="card-title fs-5 mb-2 fw-semibold">Legend:</h4>
                    <ul class="list-inline mb-0 d-flex flex-wrap gap-3">
                        <li class="list-inline-item"><span class="legend-color available me-1"></span> Available</li>
                        <li class="list-inline-item"><span class="legend-color pending me-1"></span> Pending</li>
                        <li class="list-inline-item"><span class="legend-color reserved me-1"></span> Reserved</li>
                        <li class="list-inline-item"><span class="legend-color occupied me-1"></span> Occupied</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card map-placeholder bg-white shadow-lg border-0 p-3">
                    <div class="card-body p-0">
                        <div class="map-wrapper">
                            <iframe id="cemeteryMapIframe" src="./simulated_map_content.php" frameborder="0" allowfullscreen="" loading="lazy"></iframe>

                            <div id="mapOverlay" class="map-overlay">
                                <div class="click-area available" data-lot-data="GARDEN|A|1|Available|"></div>
                                <div class="click-area available" data-lot-data="GARDEN|A|2|Available|"></div>
                                <div class="click-area pending" data-lot-data="GARDEN|A|3|Pending|Maria Anjelika Erese"></div>
                                <div class="click-area reserved" data-lot-data="GARDEN|B|1|Reserved|Juan Dela Cruz"></div>
                                <div class="click-area occupied" data-lot-data="GARDEN|B|2|Occupied|Deceased Name"></div>
                                <div class="click-area available" data-lot-data="GARDEN|B|3|Available|"></div>
                                <div class="click-area available" data-lot-data="PRIME|C|5|Available|"></div>
                            </div>
                            
                            <button class="btn btn-dark zoom-btn" data-bs-toggle="modal" data-bs-target="#zoomMapModal" title="Zoom In/Out">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card p-4 bg-white shadow-lg border-0 sticky-top" id="lotDetailPanel" style="top: 80px;">
                    <h3 class="card-title fs-5 mb-3 fw-bold border-bottom pb-2">Selected Lot Details</h3>
                    <div id="lotInfoContent">
                        <div class="alert alert-info" role="alert">
                            <i class="fas fa-info-circle me-2"></i> Click a lot on the map to load details here.
                        </div>
                    </div>
                    <button class="btn btn-warning mt-3 w-100 fw-bold d-none submit-btn" id="reserveLotBtn" type="button" 
                        data-bs-toggle="modal" data-bs-target="#reservationModal">
                        <i class="fas fa-hand-pointer me-2"></i> Reserve This Lot Now
                    </button>
                </div>
            </div>
        </div>
    </main>

    <div class="modal fade" id="reservationModal" tabindex="-1" aria-labelledby="reservationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title fw-bold" id="reservationModalLabel"><i class="fas fa-bookmark me-2"></i> Confirm Lot Reservation</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center p-4">
                    <p class="fs-5">You are reserving lot details:</p>
                    <p><strong>Area:</strong> <span id="modalArea" class="fw-bold text-dark"></span></p>
                    <p><strong>Block:</strong> <span id="modalBlock" class="fw-bold text-dark"></span></p>
                    <p><strong>Lot Number:</strong> <span id="modalLotNum" class="fw-bold text-dark"></span></p>
                    <p class="text-muted mt-3">Proceed to the Lot Reservation page to complete the booking forms.</p>
                </div>
                <div class="modal-footer justify-content-center">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <a href="../lotReservation/lotReservation.php" class="btn btn-warning fw-bold submit-btn" id="confirmReservationBtn">
                        <i class="fas fa-file-alt me-2"></i> Go to Reservation Form
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="zoomMapModal" tabindex="-1" aria-labelledby="zoomMapModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-fullscreen-lg-down">
            <div class="modal-content">
                <div class="modal-header bg-light">
                    <h5 class="modal-title fw-bold" id="zoomMapModalLabel"><i class="fas fa-search-plus me-2"></i> Interactive Cemetery Map (Zoom)</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-0">
                    <iframe id="zoomableMapIframe" src="./simulated_map_content_zoomable.php" frameborder="0" allowfullscreen="" loading="lazy"></iframe>
                </div>
            </div>
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
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="cemeteryMap.js"></script>
</body>
</html>
