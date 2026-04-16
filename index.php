<?php
/**
 * Dashboard - Main Page
 */
$pageTitle = 'HAMAD Airport - Fleet Management System';
$currentPage = 'dashboard';

require_once 'config/database.php';

// Get statistics
try {
    $db = getDBConnection();
    
    $stats = [
        'airplanes' => $db->query("SELECT COUNT(*) FROM airplanes")->fetchColumn(),
        'pilots' => $db->query("SELECT COUNT(*) FROM pilots")->fetchColumn(),
        'passengers' => $db->query("SELECT COUNT(*) FROM passengers")->fetchColumn(),
        'flights' => $db->query("SELECT COUNT(*) FROM passenger_flights")->fetchColumn(),
        'engines' => $db->query("SELECT COUNT(*) FROM engines")->fetchColumn()
    ];
    
    // Get recent airplanes
    $recentAirplanes = $db->query("
        SELECT a.id, a.model, a.capacity, v.brand, v.year 
        FROM airplanes a 
        JOIN vehicles v ON a.vehicle_id = v.id 
        ORDER BY a.created_at DESC 
        LIMIT 5
    ")->fetchAll();
    
    // Get recent flights
    $recentFlights = $db->query("
        SELECT pf.*, p.name as passenger_name, a.model as airplane_model
        FROM passenger_flights pf
        JOIN passengers p ON pf.passenger_id = p.id
        JOIN airplanes a ON pf.airplane_id = a.id
        ORDER BY pf.created_at DESC
        LIMIT 5
    ")->fetchAll();
    
} catch (PDOException $e) {
    $stats = ['airplanes' => 0, 'pilots' => 0, 'passengers' => 0, 'flights' => 0, 'engines' => 0];
    $recentAirplanes = [];
    $recentFlights = [];
    $error = $e->getMessage();
}

include 'includes/header.php';
?>

<!-- Welcome Section with Qatar Airport Branding -->
<div class="welcome-section" style="position: relative; overflow: hidden;">
    <!-- Decorative Qatar Pattern -->
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: repeating-linear-gradient(45deg, #d4a84b 0, #d4a84b 1px, transparent 0, transparent 50%); background-size: 20px 20px;"></div>
    
    <!-- Airport Code Badge -->
    <div style="position: absolute; top: 20px; right: 20px; background: rgba(212, 168, 75, 0.2); border: 2px solid #d4a84b; border-radius: 8px; padding: 8px 16px;">
        <span style="font-size: 1.5rem; font-weight: 800; color: #d4a84b; letter-spacing: 3px;">DOH</span>
        <div style="font-size: 0.65rem; color: #c9a86c; text-transform: uppercase;">Qatar</div>
    </div>
    
    <div style="position: relative; z-index: 1;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 10px; flex-wrap: wrap;">
            <a href="logo.php" title="View Brand Logo" onmouseover="this.querySelector('img').style.transform='scale(1.1)'; this.querySelector('img').style.filter='drop-shadow(0 0 30px rgba(212, 168, 75, 0.6))';" onmouseout="this.querySelector('img').style.transform='scale(1)'; this.querySelector('img').style.filter='drop-shadow(0 0 20px rgba(212, 168, 75, 0.4))';" style="text-decoration: none;">
                <img src="assets/images/logo.svg" alt="Hamad Airport Logo" style="width: 80px; height: 80px; filter: drop-shadow(0 0 20px rgba(212, 168, 75, 0.4)); transition: all 0.3s ease; cursor: pointer;">
            </a>
            <div>
                <div style="font-size: 0.85rem; color: #c9a86c; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 5px;">Hamad International Airport</div>
                <h1 style="margin: 0; font-size: 2.2rem;">Fleet Management System</h1>
            </div>
        </div>
        <p style="max-width: 600px; margin: 0 auto; color: #f5e6d3;">State-of-the-art aviation management platform serving the State of Qatar. Excellence in aviation since 2014.</p>
        
        <!-- Terminal Info -->
        <div style="display: flex; justify-content: center; gap: 30px; margin-top: 25px; flex-wrap: wrap;">
            <div style="text-align: center;">
                <i class="fas fa-building" style="font-size: 1.2rem; color: #d4a84b; margin-bottom: 5px;"></i>
                <div style="font-size: 0.75rem; color: #c9a86c;">TERMINAL 1</div>
            </div>
            <div style="text-align: center;">
                <i class="fas fa-satellite-dish" style="font-size: 1.2rem; color: #d4a84b; margin-bottom: 5px;"></i>
                <div style="font-size: 0.75rem; color: #c9a86c;">CONCOURSE</div>
            </div>
            <div style="text-align: center;">
                <i class="fas fa-crown" style="font-size: 1.2rem; color: #d4a84b; margin-bottom: 5px;"></i>
                <div style="font-size: 0.75rem; color: #c9a86c;">5-STAR SKYTRAX</div>
            </div>
        </div>
    </div>
</div>

<!-- Statistics Cards -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon blue">
            <i class="fas fa-plane"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo $stats['airplanes']; ?></h3>
            <p>Total Airplanes</p>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon green">
            <i class="fas fa-user-tie"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo $stats['pilots']; ?></h3>
            <p>Registered Pilots</p>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon orange">
            <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo $stats['passengers']; ?></h3>
            <p>Passengers</p>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon cyan">
            <i class="fas fa-route"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo $stats['flights']; ?></h3>
            <p>Flight Records</p>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon red">
            <i class="fas fa-cog"></i>
        </div>
        <div class="stat-content">
            <h3><?php echo $stats['engines']; ?></h3>
            <p>Engines Installed</p>
        </div>
    </div>
</div>

<!-- Quick Access Cards -->
<div class="card">
    <div class="card-header">
        <h2><i class="fas fa-th-large"></i> Quick Access</h2>
    </div>
    <div class="card-body">
        <div class="entity-grid">
            <a href="airplanes.php" class="entity-card">
                <div class="entity-icon blue">
                    <i class="fas fa-plane"></i>
                </div>
                <h3>Airplanes</h3>
                <p>Manage airplane fleet, view specifications, and track maintenance.</p>
            </a>
            
            <a href="pilots.php" class="entity-card">
                <div class="entity-icon green">
                    <i class="fas fa-user-tie"></i>
                </div>
                <h3>Pilots</h3>
                <p>Manage pilot records, licenses, and flight operations.</p>
            </a>
            
            <a href="passengers.php" class="entity-card">
                <div class="entity-icon orange">
                    <i class="fas fa-users"></i>
                </div>
                <h3>Passengers</h3>
                <p>Manage passenger information and flight bookings.</p>
            </a>
            
            <a href="components.php" class="entity-card">
                <div class="entity-icon cyan">
                    <i class="fas fa-cogs"></i>
                </div>
                <h3>Components</h3>
                <p>Manage wings, engines, cockpits, and navigation systems.</p>
            </a>
        </div>
    </div>
</div>

<!-- Recent Activity -->
<div class="card">
    <div class="card-header">
        <h2><i class="fas fa-clock"></i> Recent Airplanes</h2>
    </div>
    <div class="card-body">
        <?php if (empty($recentAirplanes)): ?>
            <div class="empty-state">
                <i class="fas fa-plane-slash"></i>
                <h3>No airplanes found</h3>
                <p>Add your first airplane to get started.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table" id="recentAirplanes">
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Year</th>
                            <th>Capacity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recentAirplanes as $airplane): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($airplane['brand']); ?></td>
                                <td><?php echo htmlspecialchars($airplane['model']); ?></td>
                                <td><?php echo htmlspecialchars($airplane['year']); ?></td>
                                <td><?php echo htmlspecialchars($airplane['capacity']); ?> seats</td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Recent Flights -->
<div class="card">
    <div class="card-header">
        <h2><i class="fas fa-history"></i> Recent Flight Records</h2>
    </div>
    <div class="card-body">
        <?php if (empty($recentFlights)): ?>
            <div class="empty-state">
                <i class="fas fa-route"></i>
                <h3>No flight records</h3>
                <p>Flight records will appear here when passengers book flights.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table" id="recentFlights">
                    <thead>
                        <tr>
                            <th>Passenger</th>
                            <th>Airplane</th>
                            <th>Route</th>
                            <th>Date</th>
                            <th>Seat</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recentFlights as $flight): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($flight['passenger_name']); ?></td>
                                <td><?php echo htmlspecialchars($flight['airplane_model']); ?></td>
                                <td><?php echo htmlspecialchars($flight['departure']); ?> → <?php echo htmlspecialchars($flight['arrival']); ?></td>
                                <td><?php echo htmlspecialchars($flight['flight_date']); ?></td>
                                <td><span class="badge badge-info"><?php echo htmlspecialchars($flight['seat_number']); ?></span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- System Info -->
<div class="card">
    <div class="card-header">
        <h2><i class="fas fa-info-circle"></i> System Information</h2>
    </div>
    <div class="card-body">
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Database</label>
                <input type="text" class="form-control" value="PostgreSQL" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Backend</label>
                <input type="text" class="form-control" value="PHP" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Frontend</label>
                <input type="text" class="form-control" value="HTML, CSS, JavaScript" readonly>
            </div>
        </div>
        <p style="margin-top: 1rem; color: var(--secondary-color);">
            <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
            All UML relationships implemented: Inheritance, Composition, Aggregation, Association, and Realization.
        </p>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
