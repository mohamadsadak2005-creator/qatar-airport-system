<?php
/**
 * Airplanes Management Page
 */
$pageTitle = 'Airplanes - Airplane Management System';
$currentPage = 'airplanes';

require_once 'config/database.php';

$message = '';
$error = '';

// Handle CRUD Operations
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = getDBConnection();
        
        if (isset($_POST['action'])) {
            switch ($_POST['action']) {
                case 'create':
                    // Create vehicle first
                    $stmt = $db->prepare("INSERT INTO vehicles (brand, year) VALUES (:brand, :year) RETURNING id");
                    $stmt->execute([
                        ':brand' => $_POST['brand'],
                        ':year' => $_POST['year']
                    ]);
                    $vehicleId = $stmt->fetchColumn();
                    
                    // Create airplane
                    $stmt = $db->prepare("INSERT INTO airplanes (vehicle_id, model, capacity) VALUES (:vehicle_id, :model, :capacity)");
                    $stmt->execute([
                        ':vehicle_id' => $vehicleId,
                        ':model' => $_POST['model'],
                        ':capacity' => $_POST['capacity']
                    ]);
                    
                    // Create cockpit (composition)
                    $airplaneId = $db->lastInsertId();
                    $stmt = $db->prepare("INSERT INTO cockpits (airplane_id, instrument_count, has_autopilot, layout_type) VALUES (:airplane_id, 100, true, 'Standard')");
                    $stmt->execute([':airplane_id' => $airplaneId]);
                    
                    $message = 'Airplane created successfully with cockpit!';
                    break;
                    
                case 'update':
                    // Update vehicle
                    $stmt = $db->prepare("UPDATE vehicles SET brand = :brand, year = :year WHERE id = (SELECT vehicle_id FROM airplanes WHERE id = :id)");
                    $stmt->execute([
                        ':brand' => $_POST['brand'],
                        ':year' => $_POST['year'],
                        ':id' => $_POST['id']
                    ]);
                    
                    // Update airplane
                    $stmt = $db->prepare("UPDATE airplanes SET model = :model, capacity = :capacity WHERE id = :id");
                    $stmt->execute([
                        ':model' => $_POST['model'],
                        ':capacity' => $_POST['capacity'],
                        ':id' => $_POST['id']
                    ]);
                    $message = 'Airplane updated successfully!';
                    break;
                    
                case 'delete':
                    // Vehicle will be deleted by CASCADE
                    $stmt = $db->prepare("DELETE FROM airplanes WHERE id = :id");
                    $stmt->execute([':id' => $_POST['id']]);
                    $message = 'Airplane deleted successfully!';
                    break;
                    
                case 'add_wing':
                    $stmt = $db->prepare("INSERT INTO wings (airplane_id, span, material, position) VALUES (:airplane_id, :span, :material, :position)");
                    $stmt->execute([
                        ':airplane_id' => $_POST['airplane_id'],
                        ':span' => $_POST['span'],
                        ':material' => $_POST['material'],
                        ':position' => $_POST['position']
                    ]);
                    $message = 'Wing added successfully!';
                    break;
                    
                case 'add_engine':
                    $stmt = $db->prepare("INSERT INTO engines (airplane_id, engine_type, horsepower, serial_number) VALUES (:airplane_id, :engine_type, :horsepower, :serial_number)");
                    $stmt->execute([
                        ':airplane_id' => $_POST['airplane_id'],
                        ':engine_type' => $_POST['engine_type'],
                        ':horsepower' => $_POST['horsepower'],
                        ':serial_number' => $_POST['serial_number']
                    ]);
                    $message = 'Engine added successfully!';
                    break;
            }
        }
    } catch (PDOException $e) {
        $error = 'Error: ' . $e->getMessage();
    }
}

// Get all airplanes
$db = getDBConnection();
$airplanes = $db->query("
    SELECT a.id, a.model, a.capacity, v.brand, v.year, v.id as vehicle_id,
           (SELECT COUNT(*) FROM wings WHERE airplane_id = a.id) as wing_count,
           (SELECT COUNT(*) FROM engines WHERE airplane_id = a.id) as engine_count,
           (SELECT COUNT(*) FROM passenger_flights WHERE airplane_id = a.id) as flight_count
    FROM airplanes a 
    JOIN vehicles v ON a.vehicle_id = v.id 
    ORDER BY a.created_at DESC
")->fetchAll();

include 'includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <h2><i class="fas fa-plane"></i> Manage Airplanes</h2>
        <button class="btn btn-success" data-modal="addAirplaneModal">
            <i class="fas fa-plus"></i> Add Airplane
        </button>
    </div>
    <div class="card-body">
        <?php if ($message): ?>
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>
        
        <div class="search-section">
            <div class="search-row">
                <div class="search-group">
                    <label class="form-label">Search Airplanes</label>
                    <input type="text" class="form-control" data-search="airplanesTable" placeholder="Search by brand, model, or year...">
                </div>
            </div>
        </div>
        
        <?php if (empty($airplanes)): ?>
            <div class="empty-state">
                <i class="fas fa-plane-slash"></i>
                <h3>No airplanes found</h3>
                <p>Click "Add Airplane" to create your first airplane record.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table" id="airplanesTable">
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Year</th>
                            <th>Capacity</th>
                            <th>Wings</th>
                            <th>Engines</th>
                            <th>Flights</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($airplanes as $airplane): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($airplane['brand']); ?></strong></td>
                                <td><?php echo htmlspecialchars($airplane['model']); ?></td>
                                <td><?php echo htmlspecialchars($airplane['year']); ?></td>
                                <td><?php echo htmlspecialchars($airplane['capacity']); ?> seats</td>
                                <td><span class="badge badge-info"><?php echo $airplane['wing_count']; ?></span></td>
                                <td><span class="badge badge-warning"><?php echo $airplane['engine_count']; ?></span></td>
                                <td><span class="badge badge-success"><?php echo $airplane['flight_count']; ?></span></td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-primary btn-sm" onclick="editAirplane(<?php echo htmlspecialchars(json_encode($airplane)); ?>)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-info btn-sm" onclick="manageComponents(<?php echo $airplane['id']; ?>, '<?php echo htmlspecialchars($airplane['model']); ?>')">
                                            <i class="fas fa-cogs"></i>
                                        </button>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this airplane?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $airplane['id']; ?>">
                                            <button type="submit" class="btn btn-danger btn-sm">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Add Airplane Modal -->
<div class="modal-overlay" id="addAirplaneModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus"></i> Add New Airplane</h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST" data-validate>
            <div class="modal-body">
                <input type="hidden" name="action" value="create">
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Brand *</label>
                        <input type="text" name="brand" class="form-control" required placeholder="e.g., Boeing">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Model *</label>
                        <input type="text" name="model" class="form-control" required placeholder="e.g., 737-800">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Year *</label>
                        <input type="number" name="year" class="form-control" required min="1900" max="2030" placeholder="e.g., 2020">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacity *</label>
                        <input type="number" name="capacity" class="form-control" required min="1" placeholder="e.g., 180">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-success">Add Airplane</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Airplane Modal -->
<div class="modal-overlay" id="editAirplaneModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-edit"></i> Edit Airplane</h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST" data-validate>
            <div class="modal-body">
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" id="edit_id">
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Brand *</label>
                        <input type="text" name="brand" id="edit_brand" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Model *</label>
                        <input type="text" name="model" id="edit_model" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Year *</label>
                        <input type="number" name="year" id="edit_year" class="form-control" required min="1900" max="2030">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacity *</label>
                        <input type="number" name="capacity" id="edit_capacity" class="form-control" required min="1">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Update Airplane</button>
            </div>
        </form>
    </div>
</div>

<!-- Manage Components Modal -->
<div class="modal-overlay" id="componentsModal">
    <div class="modal" style="max-width: 800px;">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-cogs"></i> Manage Components - <span id="componentAirplaneModel"></span></h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="component_airplane_id">
            
            <!-- Wings Section -->
            <h4 style="margin-bottom: 1rem;"><i class="fas fa-feather-alt"></i> Wings</h4>
            <form method="POST" style="margin-bottom: 2rem;">
                <input type="hidden" name="action" value="add_wing">
                <input type="hidden" name="airplane_id" id="wing_airplane_id">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Span (meters)</label>
                        <input type="number" name="span" class="form-control" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Material</label>
                        <input type="text" name="material" class="form-control" required placeholder="e.g., Aluminum">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Position</label>
                        <select name="position" class="form-control" required>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="center">Center</option>
                        </select>
                    </div>
                    <div class="form-group" style="display: flex; align-items: end;">
                        <button type="submit" class="btn btn-success">Add Wing</button>
                    </div>
                </div>
            </form>
            
            <!-- Engines Section -->
            <h4 style="margin-bottom: 1rem;"><i class="fas fa-cog"></i> Engines</h4>
            <form method="POST">
                <input type="hidden" name="action" value="add_engine">
                <input type="hidden" name="airplane_id" id="engine_airplane_id">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Engine Type</label>
                        <input type="text" name="engine_type" class="form-control" required placeholder="e.g., Turbofan">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Horsepower</label>
                        <input type="number" name="horsepower" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Serial Number</label>
                        <input type="text" name="serial_number" class="form-control" required>
                    </div>
                    <div class="form-group" style="display: flex; align-items: end;">
                        <button type="submit" class="btn btn-success">Add Engine</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function editAirplane(airplane) {
    document.getElementById('edit_id').value = airplane.id;
    document.getElementById('edit_brand').value = airplane.brand;
    document.getElementById('edit_model').value = airplane.model;
    document.getElementById('edit_year').value = airplane.year;
    document.getElementById('edit_capacity').value = airplane.capacity;
    openModal('editAirplaneModal');
}

function manageComponents(airplaneId, model) {
    document.getElementById('component_airplane_id').value = airplaneId;
    document.getElementById('wing_airplane_id').value = airplaneId;
    document.getElementById('engine_airplane_id').value = airplaneId;
    document.getElementById('componentAirplaneModel').textContent = model;
    openModal('componentsModal');
}
</script>

<?php include 'includes/footer.php'; ?>
