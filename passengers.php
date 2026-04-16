<?php
/**
 * Passengers Management Page
 */
$pageTitle = 'Passengers - Airplane Management System';
$currentPage = 'passengers';

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
                    $stmt = $db->prepare("INSERT INTO passengers (name, passport_number, date_of_birth, nationality) VALUES (:name, :passport_number, :date_of_birth, :nationality)");
                    $stmt->execute([
                        ':name' => $_POST['name'],
                        ':passport_number' => $_POST['passport_number'],
                        ':date_of_birth' => $_POST['date_of_birth'] ?: null,
                        ':nationality' => $_POST['nationality'] ?: null
                    ]);
                    $message = 'Passenger added successfully!';
                    break;
                    
                case 'update':
                    $stmt = $db->prepare("UPDATE passengers SET name = :name, passport_number = :passport_number, date_of_birth = :date_of_birth, nationality = :nationality WHERE id = :id");
                    $stmt->execute([
                        ':name' => $_POST['name'],
                        ':passport_number' => $_POST['passport_number'],
                        ':date_of_birth' => $_POST['date_of_birth'] ?: null,
                        ':nationality' => $_POST['nationality'] ?: null,
                        ':id' => $_POST['id']
                    ]);
                    $message = 'Passenger updated successfully!';
                    break;
                    
                case 'delete':
                    $stmt = $db->prepare("DELETE FROM passengers WHERE id = :id");
                    $stmt->execute([':id' => $_POST['id']]);
                    $message = 'Passenger deleted successfully!';
                    break;
                    
                case 'book_flight':
                    $stmt = $db->prepare("INSERT INTO passenger_flights (passenger_id, airplane_id, seat_number, flight_date, departure, arrival) VALUES (:passenger_id, :airplane_id, :seat_number, :flight_date, :departure, :arrival)");
                    $stmt->execute([
                        ':passenger_id' => $_POST['passenger_id'],
                        ':airplane_id' => $_POST['airplane_id'],
                        ':seat_number' => $_POST['seat_number'],
                        ':flight_date' => $_POST['flight_date'],
                        ':departure' => $_POST['departure'],
                        ':arrival' => $_POST['arrival']
                    ]);
                    $message = 'Flight booked successfully!';
                    break;
            }
        }
    } catch (PDOException $e) {
        $error = 'Error: ' . $e->getMessage();
    }
}

// Get all passengers
$db = getDBConnection();
$passengers = $db->query("
    SELECT p.*, 
           (SELECT COUNT(*) FROM passenger_flights WHERE passenger_id = p.id) as flight_count
    FROM passengers p 
    ORDER BY p.created_at DESC
")->fetchAll();

// Get airplanes for booking
$airplanes = $db->query("SELECT a.id, a.model, v.brand FROM airplanes a JOIN vehicles v ON a.vehicle_id = v.id ORDER BY a.model")->fetchAll();

include 'includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <h2><i class="fas fa-users"></i> Manage Passengers</h2>
        <button class="btn btn-success" data-modal="addPassengerModal">
            <i class="fas fa-plus"></i> Add Passenger
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
                    <label class="form-label">Search Passengers</label>
                    <input type="text" class="form-control" data-search="passengersTable" placeholder="Search by name or passport...">
                </div>
            </div>
        </div>
        
        <?php if (empty($passengers)): ?>
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <h3>No passengers found</h3>
                <p>Click "Add Passenger" to register your first passenger.</p>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="data-table" id="passengersTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Passport</th>
                            <th>Date of Birth</th>
                            <th>Nationality</th>
                            <th>Flights</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($passengers as $passenger): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($passenger['name']); ?></strong></td>
                                <td><span class="badge badge-info"><?php echo htmlspecialchars($passenger['passport_number']); ?></span></td>
                                <td><?php echo $passenger['date_of_birth'] ? htmlspecialchars($passenger['date_of_birth']) : '-'; ?></td>
                                <td><?php echo $passenger['nationality'] ? htmlspecialchars($passenger['nationality']) : '-'; ?></td>
                                <td><span class="badge badge-success"><?php echo $passenger['flight_count']; ?></span></td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-primary btn-sm" onclick="editPassenger(<?php echo htmlspecialchars(json_encode($passenger)); ?>)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-info btn-sm" onclick="bookFlight(<?php echo $passenger['id']; ?>, '<?php echo htmlspecialchars($passenger['name']); ?>')">
                                            <i class="fas fa-ticket-alt"></i>
                                        </button>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this passenger?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $passenger['id']; ?>">
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

<!-- Add Passenger Modal -->
<div class="modal-overlay" id="addPassengerModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus"></i> Add New Passenger</h3>
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
                        <label class="form-label">Passport Number *</label>
                        <input type="text" name="passport_number" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" name="date_of_birth" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nationality</label>
                        <input type="text" name="nationality" class="form-control" placeholder="e.g., American">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-success">Add Passenger</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Passenger Modal -->
<div class="modal-overlay" id="editPassengerModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-edit"></i> Edit Passenger</h3>
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
                        <label class="form-label">Passport Number *</label>
                        <input type="text" name="passport_number" id="edit_passport" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" name="date_of_birth" id="edit_dob" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nationality</label>
                        <input type="text" name="nationality" id="edit_nationality" class="form-control">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Update Passenger</button>
            </div>
        </form>
    </div>
</div>

<!-- Book Flight Modal -->
<div class="modal-overlay" id="bookFlightModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-ticket-alt"></i> Book Flight - <span id="bookPassengerName"></span></h3>
            <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form method="POST" data-validate>
            <div class="modal-body">
                <input type="hidden" name="action" value="book_flight">
                <input type="hidden" name="passenger_id" id="book_passenger_id">
                
                <div class="form-group">
                    <label class="form-label">Select Airplane *</label>
                    <select name="airplane_id" class="form-control" required>
                        <option value="">-- Select Airplane --</option>
                        <?php foreach ($airplanes as $airplane): ?>
                            <option value="<?php echo $airplane['id']; ?>"><?php echo htmlspecialchars($airplane['brand'] . ' ' . $airplane['model']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">From (Departure) *</label>
                        <input type="text" name="departure" class="form-control" required placeholder="e.g., New York">
                    </div>
                    <div class="form-group">
                        <label class="form-label">To (Arrival) *</label>
                        <input type="text" name="arrival" class="form-control" required placeholder="e.g., London">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Flight Date *</label>
                        <input type="date" name="flight_date" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Seat Number</label>
                        <input type="text" name="seat_number" class="form-control" placeholder="e.g., 12A">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-success">Book Flight</button>
            </div>
        </form>
    </div>
</div>

<script>
function editPassenger(passenger) {
    document.getElementById('edit_id').value = passenger.id;
    document.getElementById('edit_name').value = passenger.name;
    document.getElementById('edit_passport').value = passenger.passport_number;
    document.getElementById('edit_dob').value = passenger.date_of_birth || '';
    document.getElementById('edit_nationality').value = passenger.nationality || '';
    openModal('editPassengerModal');
}

function bookFlight(passengerId, passengerName) {
    document.getElementById('book_passenger_id').value = passengerId;
    document.getElementById('bookPassengerName').textContent = passengerName;
    openModal('bookFlightModal');
}
</script>

<?php include 'includes/footer.php'; ?>
