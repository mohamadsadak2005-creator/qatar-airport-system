<?php
/**
 * Pilots Management Page
 */
$pageTitle = 'Pilots - Airplane Management System';
$currentPage = 'pilots';

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
                    $stmt = $db->prepare("INSERT INTO pilots (name, license_number, experience_years, phone, email) VALUES (:name, :license_number, :experience_years, :phone, :email)");
                    $stmt->execute([
                        ':name' => $_POST['name'],
                        ':license_number' => $_POST['license_number'],
                        ':experience_years' => $_POST['experience_years'] ?: 0,
                        ':phone' => $_POST['phone'] ?: null,
                        ':email' => $_POST['email'] ?: null
                    ]);
                    $message = 'Pilot added successfully!';
                    break;
                    
                case 'update':
                    $stmt = $db->prepare("UPDATE pilots SET name = :name, license_number = :license_number, experience_years = :experience_years, phone = :phone, email = :email WHERE id = :id");
                    $stmt->execute([
                        ':name' => $_POST['name'],
                        ':license_number' => $_POST['license_number'],
                        ':experience_years' => $_POST['experience_years'] ?: 0,
                        ':phone' => $_POST['phone'] ?: null,
                        ':email' => $_POST['email'] ?: null,
                        ':id' => $_POST['id']
                    ]);
                    $message = 'Pilot updated successfully!';
                    break;
                    
                case 'delete':
                    $stmt = $db->prepare("DELETE FROM pilots WHERE id = :id");
                    $stmt->execute([':id' => $_POST['id']]);
                    $message = 'Pilot deleted successfully!';
                    break;
                    
                case 'assign_operation':
                    $stmt = $db->prepare("INSERT INTO pilot_operations (pilot_id, airplane_id, operation_date, flight_number) VALUES (:pilot_id, :airplane_id, :operation_date, :flight_number)");
                    $stmt->execute([
                        ':pilot_id' => $_POST['pilot_id'],
                        ':airplane_id' => $_POST['airplane_id'],
                        ':operation_date' => $_POST['operation_date'],
                        ':flight_number' => $_POST['flight_number']
                    ]);
                    $message = 'Operation assigned successfully!';
                    break;
            }
        }
    } catch (PDOException $e) {
        $error = 'Error: ' . $e->getMessage();
    }
}

// Get all pilots
$db = getDBConnection();
$pilots = $db->query("
    SELECT p.*, 
           (SELECT COUNT(*) FROM pilot_operations WHERE pilot_id = p.id) as operation_count
    FROM pilots p 
    ORDER BY p.created_at DESC
")->fetchAll();

// Get airplanes for assignment
$airplanes = $db->query("SELECT id, model FROM airplanes ORDER BY model")->fetchAll();

include 'includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <h2><i class="fas fa-user-tie"></i> Manage Pilots</h2>
        <button class="btn btn-success" data-modal="addPilotModal">
            <i class="fas fa-plus"></i> Add Pilot
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
                    <label class="form-label">Search Pilots</label>
                    <input type="text" class="form-control" data-search="pilotsTable" placeholder="Search by name or license...">
                </div>
            </div>
        </div>
        
        <?php if (empty($pilots)): ?>
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <h3>No pilots found</h3>
                <p>Click "Add Pilot" to register your first pilot.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table" id="pilotsTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>License Number</th>
                            <th>Experience</th>
                            <th>Contact</th>
                            <th>Operations</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($pilots as $pilot): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($pilot['name']); ?></strong></td>
                                <td><span class="badge badge-info"><?php echo htmlspecialchars($pilot['license_number']); ?></span></td>
                                <td><?php echo htmlspecialchars($pilot['experience_years']); ?> years</td>
                                <td>
                                    <?php if ($pilot['email']): ?>
                                        <small><i class="fas fa-envelope"></i> <?php echo htmlspecialchars($pilot['email']); ?></small><br>
                                    <?php endif; ?>
                                    <?php if ($pilot['phone']): ?>
                                        <small><i class="fas fa-phone"></i> <?php echo htmlspecialchars($pilot['phone']); ?></small>
                                    <?php endif; ?>
                                </td>
                                <td><span class="badge badge-success"><?php echo $pilot['operation_count']; ?></span></td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-primary btn-sm" onclick="editPilot(<?php echo htmlspecialchars(json_encode($pilot)); ?>)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-info btn-sm" onclick="assignOperation(<?php echo $pilot['id']; ?>, '<?php echo htmlspecialchars($pilot['name']); ?>')">
                                            <i class="fas fa-plane"></i>
                                        </button>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this pilot?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $pilot['id']; ?>">
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

<!-- Add Pilot Modal -->
<div class="modal-overlay" id="addPilotModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus"></i> Add New Pilot</h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST" data-validate>
            <div class="modal-body">
                <input type="hidden" name="action" value="create">
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Full Name *</label>
                        <input type="text" name="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">License Number *</label>
                        <input type="text" name="license_number" class="form-control" required placeholder="e.g., ATPL-12345">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Experience (Years)</label>
                        <input type="number" name="experience_years" class="form-control" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="text" name="phone" class="form-control">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-control">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-success">Add Pilot</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Pilot Modal -->
<div class="modal-overlay" id="editPilotModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-edit"></i> Edit Pilot</h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST" data-validate>
            <div class="modal-body">
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" id="edit_id">
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Full Name *</label>
                        <input type="text" name="name" id="edit_name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">License Number *</label>
                        <input type="text" name="license_number" id="edit_license" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Experience (Years)</label>
                        <input type="number" name="experience_years" id="edit_experience" class="form-control" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="text" name="phone" id="edit_phone" class="form-control">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" id="edit_email" class="form-control">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Update Pilot</button>
            </div>
        </form>
    </div>
</div>

<!-- Assign Operation Modal -->
<div class="modal-overlay" id="assignOperationModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plane"></i> Assign Operation - <span id="operationPilotName"></span></h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST" data-validate>
            <div class="modal-body">
                <input type="hidden" name="action" value="assign_operation">
                <input type="hidden" name="pilot_id" id="operation_pilot_id">
                
                <div class="form-group">
                    <label class="form-label">Select Airplane *</label>
                    <select name="airplane_id" class="form-control" required>
                        <option value="">-- Select Airplane --</option>
                        <?php foreach ($airplanes as $airplane): ?>
                            <option value="<?php echo $airplane['id']; ?>"><?php echo htmlspecialchars($airplane['model']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Operation Date *</label>
                        <input type="date" name="operation_date" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Flight Number</label>
                        <input type="text" name="flight_number" class="form-control" placeholder="e.g., BA101">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-success">Assign Operation</button>
            </div>
        </form>
    </div>
</div>

<script>
function editPilot(pilot) {
    document.getElementById('edit_id').value = pilot.id;
    document.getElementById('edit_name').value = pilot.name;
    document.getElementById('edit_license').value = pilot.license_number;
    document.getElementById('edit_experience').value = pilot.experience_years;
    document.getElementById('edit_phone').value = pilot.phone || '';
    document.getElementById('edit_email').value = pilot.email || '';
    openModal('editPilotModal');
}

function assignOperation(pilotId, pilotName) {
    document.getElementById('operation_pilot_id').value = pilotId;
    document.getElementById('operationPilotName').textContent = pilotName;
    openModal('assignOperationModal');
}
</script>

<?php include 'includes/footer.php'; ?>
