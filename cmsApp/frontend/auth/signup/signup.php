<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blessed Saint John Memorial - Sign Up</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
    <link rel="stylesheet" href="signup.css" />
</head>
<body>

    <!-- ======== NAVBAR ======== -->
    <nav class="navbar navbar-expand-lg navbar-light bg-warning sticky-top shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">
                <span class="d-none d-sm-inline">Blessed Saint John Memorial Gardens and Park</span>
                <span class="d-sm-none">BSJ Memorial Park</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item"><a class="nav-link" href="../login/login.php#login">Login</a></li>
                    <li class="nav-item"><a class="nav-link" href="../login/login.php#home">Home</a></li>
                    <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Join</a></li>
                    <li class="nav-item"><a class="nav-link" href="../login/login.php#about">About Us</a></li>
                    <li class="nav-item"><a class="nav-link" href="../login/login.php#appointment">Appointment</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- ======== FULL SCREEN SIGNUP SECTION ======== -->
    <section id="signup" class="signup-fullscreen">
        <div class="signup-background-overlay"></div>
        
        <!-- Cemetery Background Elements -->
        <div class="cemetery-elements">
            <div class="floating-element element-1"></div>
            <div class="floating-element element-2"></div>
            <div class="floating-element element-3"></div>
            <div class="floating-element element-4"></div>
        </div>
        
        <div class="signup-container">
            <div class="signup-content">
                <!-- Logo Section -->
                <div class="signup-header">
                    <div class="signup-logo">
                        <div class="logo-text">
                            <h1 class="system-title">Blessed Saint John</h1>
                            <p class="system-subtitle">Memorial Gardens Management System</p>
                        </div>
                    </div>
                </div>

                <!-- Signup Form Card -->
                <div class="signup-card">
                    <div class="signup-card-header">
                        <h2 class="signup-title">Create Account</h2>
                        <p class="signup-subtitle">Join our memorial community</p>
                    </div>
                    
                    <div class="signup-card-body">
                        <form id="signupForm" method="POST" action="http://localhost/stJohnCmsApp/cms.api/signup.php">
                            <div class="row g-2 mb-3">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <i class="bi bi-person input-icon"></i>
                                        <input type="text" id="firstName" name="firstName" class="form-control" placeholder="First Name" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <i class="bi bi-person input-icon"></i>
                                        <input type="text" id="lastName" name="lastName" class="form-control" placeholder="Last Name" required>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group mb-3">
                                <i class="bi bi-envelope input-icon"></i>
                                <input type="email" id="email" name="email" class="form-control" placeholder="Email Address" required>
                            </div>

                            <div class="form-group mb-3">
                                <i class="bi bi-telephone input-icon"></i>
                                <input type="tel" id="contactNumber" name="contactNumber" class="form-control" placeholder="Phone Number" required>
                            </div>

                            <div class="form-group mb-3">
                                <i class="bi bi-lock input-icon"></i>
                                <input type="password" id="password" name="password" class="form-control" placeholder="Password" required>
                                <i class="bi bi-eye-slash password-toggle" onclick="togglePassword('password', this)"></i>
                            </div>

                            <div class="form-group mb-3">
                                <i class="bi bi-lock-fill input-icon"></i>
                                <input type="password" id="confirmPassword" name="confirmPassword" class="form-control" placeholder="Confirm Password" required>
                                <i class="bi bi-eye-slash password-toggle" onclick="togglePassword('confirmPassword', this)"></i>
                            </div>

                            <div class="form-group mb-3">
                                <i class="bi bi-person-plus input-icon"></i>
                                <input type="text" id="emergencyContactName" name="emergencyContactName" class="form-control" placeholder="Emergency Contact Name" required>
                            </div>

                            <div class="form-group mb-4">
                                <i class="bi bi-telephone-plus input-icon"></i>
                                <input type="tel" id="emergencyContactNumber" name="emergencyContactNumber" class="form-control" placeholder="Emergency Contact Number" required>
                            </div>

                            <button type="submit" class="btn-signup">
                                <span class="btn-text">Create Account</span>
                                <i class="bi bi-arrow-right btn-icon"></i>
                            </button>

                            <div class="form-footer">
                                <p>Already have an account? <a href="../login/login.php" class="signup-link">Sign In</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JS -->
    <script src="signup.js"></script>
</body>
</html>
