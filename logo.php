<?php
/**
 * Logo Showcase Page - Hamad International Airport
 */
$pageTitle = 'Brand Logo - Hamad International Airport';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="icon" type="image/svg+xml" href="assets/images/logo.svg">
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #2d0a0f, #1a0508);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .logo-container {
            text-align: center;
            padding: 3rem;
        }
        
        .main-logo {
            width: 300px;
            height: 300px;
            filter: drop-shadow(0 0 40px rgba(212, 168, 75, 0.4));
            animation: logo-pulse 3s ease-in-out infinite;
        }
        
        @keyframes logo-pulse {
            0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 40px rgba(212, 168, 75, 0.4));
            }
            50% {
                transform: scale(1.02);
                filter: drop-shadow(0 0 60px rgba(212, 168, 75, 0.6));
            }
        }
        
        .brand-name {
            margin-top: 2rem;
            color: #d4a84b;
            font-size: 2.5rem;
            font-weight: 800;
            letter-spacing: 8px;
            text-transform: uppercase;
        }
        
        .brand-tagline {
            margin-top: 0.5rem;
            color: #c9a86c;
            font-size: 1rem;
            letter-spacing: 4px;
        }
        
        .brand-location {
            margin-top: 1rem;
            color: #9a4b55;
            font-size: 0.9rem;
            letter-spacing: 2px;
        }
        
        .back-link {
            position: fixed;
            top: 2rem;
            left: 2rem;
            color: #d4a84b;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            padding: 0.75rem 1rem;
            border: 1px solid #d4a84b;
            border-radius: 8px;
        }
        
        .back-link:hover {
            background: rgba(212, 168, 75, 0.1);
            transform: translateX(-5px);
        }
        
        .logo-variations {
            margin-top: 3rem;
            display: flex;
            gap: 2rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .logo-variation {
            text-align: center;
        }
        
        .logo-variation img {
            width: 100px;
            height: 100px;
            opacity: 0.7;
            transition: all 0.3s ease;
        }
        
        .logo-variation:hover img {
            opacity: 1;
            transform: scale(1.1);
        }
        
        .logo-variation p {
            margin-top: 0.5rem;
            color: #9a4b55;
            font-size: 0.75rem;
        }
        
        /* Floating particles */
        .particle {
            position: fixed;
            width: 10px;
            height: 10px;
            background: rgba(212, 168, 75, 0.2);
            border-radius: 50%;
            animation: float 15s infinite;
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(100vh) scale(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) scale(1.5);
                opacity: 0;
            }
        }
        
        .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { left: 30%; animation-delay: 2s; }
        .particle:nth-child(3) { left: 50%; animation-delay: 4s; }
        .particle:nth-child(4) { left: 70%; animation-delay: 1s; }
        .particle:nth-child(5) { left: 90%; animation-delay: 3s; }
    </style>
</head>
<body>
    <!-- Background Particles -->
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    
    <a href="index.php" class="back-link">
        <i class="fas fa-arrow-left"></i>
        Back to Dashboard
    </a>
    
    <div class="logo-container">
        <img src="assets/images/logo.svg" alt="Hamad International Airport Logo" class="main-logo">
        <h1 class="brand-name">HAMAD AIRPORT</h1>
        <p class="brand-tagline">Excellence in Aviation</p>
        <p class="brand-location">DOHA • STATE OF QATAR</p>
        
        <div class="logo-variations">
            <div class="logo-variation">
                <img src="assets/images/logo.svg" alt="Logo Small" style="filter: grayscale(100%);">
                <p>Monochrome</p>
            </div>
            <div class="logo-variation">
                <img src="assets/images/logo.svg" alt="Logo Small" style="filter: brightness(1.3);">
                <p>Bright</p>
            </div>
            <div class="logo-variation">
                <img src="assets/images/logo.svg" alt="Logo Small" style="filter: contrast(1.2);">
                <p>High Contrast</p>
            </div>
        </div>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
</body>
</html>
