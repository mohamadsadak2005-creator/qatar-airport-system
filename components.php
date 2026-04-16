<?php
/**
 * Components Management Page (Wings, Engines, Cockpits, Navigation Systems)
 */
$pageTitle = 'Components - Airplane Management System';
$currentPage = 'components';

require_once 'config/database.php';

$message = '';
$error = '';

// Handle CRUD Operations
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = getDBConnection();
        
        if (isset($_POST['action'])) {
            switch ($_POST['action']) {
                case 'delete_wing':
                    $stmt = $db->prepare("DELETE FROM wings WHERE id = :id");
                    $stmt->execute([':id' => $_POST['id']]);
                    $message = 'Wing deleted successfully!';
                    break;
                    
                case 'delete_engine':
                    $stmt = $db->prepare("DELETE FROM engines WHERE id = :id");
                    $stmt->execute([':id' => $_POST['id']]);
                    $message = 'Engine deleted successfully!';
                    break;
                    
                case 'update_cockpit':
                    $stmt = $db->prepare("UPDATE cockpits SET instrument_count = :instrument_count, has_autopilot = :has_autopilot, layout_type = :layout_type WHERE id = :id");
                    $stmt->execute([
                        ':instrument_count' => $_POST['instrument_count'],
                        ':has_autopilot' => isset($_POST['has_autopilot']) ? true : false,
                        ':layout_type' => $_POST['layout_type'],
                        ':id' => $_POST['id']
                    ]);
                    $message = 'Cockpit updated successfully!';
                    break;
                    
                case 'update_nav_system':
                    $stmt = $db->prepare("UPDATE navigation_systems SET gps_version = :gps_version, radar_type = :radar_type, autopilot_capability = :autopilot_capability, last_calibration = :last_calibration WHERE id = :id");
                    $stmt->execute([
                        ':gps_version' => $_POST['gps_version'],
                        ':radar_type' => $_POST['radar_type'],
                        ':autopilot_capability' => isset($_POST['autopilot_capability']) ? true : false,
                        ':last_calibration' => $_POST['last_calibration'] ?: null,
                        ':id' => $_POST['id']
                    ]);
                    $message = 'Navigation system updated successfully!';
                    break;
                    
                case 'add_bird':
                    $stmt = $db->prepare("INSERT INTO birds (species, wingspan, average_weight, can_fly, habitat) VALUES (:species, :wingspan, :average_weight, :can_fly, :habitat)");
                    $stmt->execute([
                        ':species' => $_POST['species'],
                        ':wingspan' => $_POST['wingspan'],
                        ':average_weight' => $_POST['average_weight'] ?: null,
                        ':can_fly' => isset($_POST['can_fly']) ? true : false,
                        ':habitat' => $_POST['habitat'] ?: null
                    ]);
                    $message = 'Bird added successfully! (Flyable implementation)';
                    break;
                    
                case 'delete_bird':
                    $stmt = $db->prepare("DELETE FROM birds WHERE id = :id");
                    $stmt->execute([':id' => $_POST['id']]);
                    $message = 'Bird deleted successfully!';
                    break;
            }
        }
    } catch (PDOException $e) {
        $error = 'Error: ' . $e->getMessage();
    }
}

// Get all components
$db = getDBConnection();

$wings = $db->query("
    SELECT w.*, a.model as airplane_model, v.brand as airplane_brand
    FROM wings w
    JOIN airplanes a ON w.airplane_id = a.id
    JOIN vehicles v ON a.vehicle_id = v.id
    ORDER BY w.created_at DESC
")->fetchAll();

$engines = $db->query("
    SELECT e.*, a.model as airplane_model, v.brand as airplane_brand
    FROM engines e
    JOIN airplanes a ON e.airplane_id = a.id
    JOIN vehicles v ON a.vehicle_id = v.id
    ORDER BY e.created_at DESC
")->fetchAll();

$cockpits = $db->query("
    SELECT c.*, a.model as airplane_model, v.brand as airplane_brand
    FROM cockpits c
    JOIN airplanes a ON c.airplane_id = a.id
    JOIN vehicles v ON a.vehicle_id = v.id
    ORDER BY c.created_at DESC
")->fetchAll();

$navSystems = $db->query("
    SELECT ns.*, a.model as airplane_model, v.brand as airplane_brand
    FROM navigation_systems ns
    LEFT JOIN airplanes a ON ns.airplane_id = a.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    ORDER BY ns.created_at DESC
")->fetchAll();

$birds = $db->query("SELECT * FROM birds ORDER BY created_at DESC")->fetchAll();

// Get airplanes for dropdowns
$airplanes = $db->query("SELECT a.id, a.model, v.brand FROM airplanes a JOIN vehicles v ON a.vehicle_id = v.id ORDER BY a.model")->fetchAll();

include 'includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <h2><i class="fas fa-cogs"></i> Airplane Components</h2>
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
        
        <!-- Wings Section -->
        <h3 style="margin: 2rem 0 1rem;"><i class="fas fa-feather-alt"></i> Wings (Composition)</h3>
        <?php if (empty($wings)): ?>
            <div class="empty-state">
                <p>No wings found. Add wings from the Airplanes page.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Airplane</th>
                            <th>Span (m)</th>
                            <th>Material</th>
                            <th>Position</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($wings as $wing): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($wing['airplane_brand'] . ' ' . $wing['airplane_model']); ?></td>
                                <td><?php echo htmlspecialchars($wing['span']); ?> m</td>
                                <td><?php echo htmlspecialchars($wing['material']); ?></td>
                                <td><span class="badge badge-info"><?php echo htmlspecialchars(ucfirst($wing['position'])); ?></span></td>
                                <td>
                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this wing?')">
                                        <input type="hidden" name="action" value="delete_wing">
                                        <input type="hidden" name="id" value="<?php echo $wing['id']; ?>">
                                        <button type="submit" class="btn btn-danger btn-sm">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
        
        <!-- Engines Section -->
        <h3 style="margin: 2rem 0 1rem;"><i class="fas fa-cog"></i> Engines (Composition)</h3>
        <?php if (empty($engines)): ?>
            <div class="empty-state">
                <p>No engines found. Add engines from the Airplanes page.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Airplane</th>
                            <th>Type</th>
                            <th>Horsepower</th>
                            <th>Serial Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($engines as $engine): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($engine['airplane_brand'] . ' ' . $engine['airplane_model']); ?></td>
                                <td><?php echo htmlspecialchars($engine['engine_type']); ?></td>
                                <td><?php echo htmlspecialchars($engine['horsepower']); ?> HP</td>
                                <td><span class="badge badge-warning"><?php echo htmlspecialchars($engine['serial_number']); ?></span></td>
                                <td>
                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this engine?')">
                                        <input type="hidden" name="action" value="delete_engine">
                                        <input type="hidden" name="id" value="<?php echo $engine['id']; ?>">
                                        <button type="submit" class="btn btn-danger btn-sm">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
        
        <!-- Cockpits Section -->
        <h3 style="margin: 2rem 0 1rem;"><i class="fas fa-compass"></i> Cockpits (Composition)</h3>
        <?php if (empty($cockpits)): ?>
            <div class="empty-state">
                <p>No cockpits found.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Airplane</th>
                            <th>Layout Type</th>
                            <th>Instruments</th>
                            <th>Autopilot</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($cockpits as $cockpit): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($cockpit['airplane_brand'] . ' ' . $cockpit['airplane_model']); ?></td>
                                <td><?php echo htmlspecialchars($cockpit['layout_type']); ?></td>
                                <td><?php echo htmlspecialchars($cockpit['instrument_count']); ?></td>
                                <td>
                                    <?php if ($cockpit['has_autopilot']): ?>
                                        <span class="badge badge-success"><i class="fas fa-check"></i> Yes</span>
                                    <?php else: ?>
                                        <span class="badge badge-danger"><i class="fas fa-times"></i> No</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <button class="btn btn-primary btn-sm" onclick="editCockpit(<?php echo htmlspecialchars(json_encode($cockpit)); ?>)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
        
        <!-- Navigation Systems Section -->
        <h3 style="margin: 2rem 0 1rem;"><i class="fas fa-satellite-dish"></i> Navigation Systems (Association)</h3>
        <?php if (empty($navSystems)): ?>
            <div class="empty-state">
                <p>No navigation systems found.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Airplane</th>
                            <th>GPS Version</th>
                            <th>Radar Type</th>
                            <th>Autopilot</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($navSystems as $nav): ?>
                            <tr>
                                <td><?php echo $nav['airplane_model'] ? htmlspecialchars($nav['airplane_brand'] . ' ' . $nav['airplane_model']) : 'Unassigned'; ?></td>
                                <td><?php echo htmlspecialchars($nav['gps_version']); ?></td>
                                <td><?php echo htmlspecialchars($nav['radar_type']); ?></td>
                                <td>
                                    <?php if ($nav['autopilot_capability']): ?>
                                        <span class="badge badge-success"><i class="fas fa-check"></i> Yes</span>
                                    <?php else: ?>
                                        <span class="badge badge-danger"><i class="fas fa-times"></i> No</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <button class="btn btn-primary btn-sm" onclick="editNavSystem(<?php echo htmlspecialchars(json_encode($nav)); ?>)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
        
        <!-- Birds Section (Flyable Implementation) -->
        <h3 style="margin: 2rem 0 1rem;"><i class="fas fa-dove"></i> Birds (Flyable Realization)</h3>
        <div style="margin-bottom: 1rem;">
            <button class="btn btn-success btn-sm" data-modal="addBirdModal">
                <i class="fas fa-plus"></i> Add Bird
            </button>
        </div>
        <?php if (empty($birds)): ?>
            <div class="empty-state">
                <p>No birds found. Add birds to demonstrate the Flyable realization.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Species</th>
                            <th>Wingspan (cm)</th>
                            <th>Weight (g)</th>
                            <th>Can Fly</th>
                            <th>Habitat</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($birds as $bird): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($bird['species']); ?></strong></td>
                                <td><?php echo htmlspecialchars($bird['wingspan']); ?> cm</td>
                                <td><?php echo htmlspecialchars($bird['average_weight']); ?> g</td>
                                <td>
                                    <?php if ($bird['can_fly']): ?>
                                        <span class="badge badge-success"><i class="fas fa-check"></i> Yes</span>
                                    <?php else: ?>
                                        <span class="badge badge-danger"><i class="fas fa-times"></i> No</span>
                                    <?php endif; ?>
                                </td>
                                <td><?php echo htmlspecialchars($bird['habitat'] ?: '-'); ?></td>
                                <td>
                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this bird?')">
                                        <input type="hidden" name="action" value="delete_bird">
                                        <input type="hidden" name="id" value="<?php echo $bird['id']; ?>">
                                        <button type="submit" class="btn btn-danger btn-sm">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Edit Cockpit Modal -->
<div class="modal-overlay" id="editCockpitModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-edit"></i> Edit Cockpit</h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="update_cockpit">
                <input type="hidden" name="id" id="cockpit_id">
                
                <div class="form-group">
                    <label class="form-label">Layout Type</label>
                    <input type="text" name="layout_type" id="cockpit_layout" class="form-control">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Instrument Count</label>
                        <input type="number" name="instrument_count" id="cockpit_instruments" class="form-control" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">&nbsp;</label>
                        <div class="form-check">
                            <input type="checkbox" name="has_autopilot" id="cockpit_autopilot" class="form-check-input">
                            <label for="cockpit_autopilot">Has Autopilot</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Update Cockpit</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Navigation System Modal -->
<div class="modal-overlay" id="editNavSystemModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-edit"></i> Edit Navigation System</h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="update_nav_system">
                <input type="hidden" name="id" id="nav_id">
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">GPS Version</label>
                        <input type="text" name="gps_version" id="nav_gps" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Radar Type</label>
                        <input type="text" name="radar_type" id="nav_radar" class="form-control">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Last Calibration</label>
                        <input type="date" name="last_calibration" id="nav_calibration" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">&nbsp;</label>
                        <div class="form-check">
                            <input type="checkbox" name="autopilot_capability" id="nav_autopilot" class="form-check-input">
                            <label for="nav_autopilot">Autopilot Capability</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Update Navigation System</button>
            </div>
        </form>
    </div>
</div>

<!-- Add Bird Modal -->
<div class="modal-overlay" id="addBirdModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus"></i> Add Bird (Flyable)</h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST" data-validate>
            <div class="modal-body">
                <input type="hidden" name="action" value="add_bird">
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Species *</label>
                        <input type="text" name="species" class="form-control" required placeholder="e.g., Bald Eagle">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Wingspan (cm)</label>
                        <input type="number" name="wingspan" class="form-control" step="0.01" placeholder="e.g., 200">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Average Weight (g)</label>
                        <input type="number" name="average_weight" class="form-control" step="0.01" placeholder="e.g., 4500">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Habitat</label>
                        <input type="text" name="habitat" class="form-control" placeholder="e.g., North America">
                    </div>
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" name="can_fly" class="form-check-input" checked>
                        <label>Can Fly (implements Flyable interface)</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-success">Add Bird</button>
            </div>
        </form>
    </div>
</div>

<script>
function editCockpit(cockpit) {
    document.getElementById('cockpit_id').value = cockpit.id;
    document.getElementById('cockpit_layout').value = cockpit.layout_type;
    document.getElementById('cockpit_instruments').value = cockpit.instrument_count;
    document.getElementById('cockpit_autopilot').checked = cockpit.has_autopilot == 't' || cockpit.has_autopilot == 1;
    openModal('editCockpitModal');
}

function editNavSystem(nav) {
    document.getElementById('nav_id').value = nav.id;
    document.getElementById('nav_gps').value = nav.gps_version;
    document.getElementById('nav_radar').value = nav.radar_type;
    document.getElementById('nav_calibration').value = nav.last_calibration || '';
    document.getElementById('nav_autopilot').checked = nav.autopilot_capability == 't' || nav.autopilot_capability == 1;
    openModal('editNavSystemModal');
}
</script>

<?php include 'includes/footer.php'; ?>
