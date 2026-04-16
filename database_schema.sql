-- ============================================
-- Airplane Management System - PostgreSQL Schema
-- ============================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS passenger_flights CASCADE;
DROP TABLE IF EXISTS pilot_operations CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS pilots CASCADE;
DROP TABLE IF EXISTS navigation_systems CASCADE;
DROP TABLE IF EXISTS engines CASCADE;
DROP TABLE IF EXISTS wings CASCADE;
DROP TABLE IF EXISTS cockpits CASCADE;
DROP TABLE IF EXISTS birds CASCADE;
DROP TABLE IF EXISTS airplanes CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;

-- ============================================
-- 1. VEHICLE TABLE (Base class)
-- ============================================
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year > 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. AIRPLANE TABLE (Inherits from Vehicle)
-- ============================================
CREATE TABLE airplanes (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. WING TABLE (Composition with Airplane)
-- ============================================
CREATE TABLE wings (
    id SERIAL PRIMARY KEY,
    airplane_id INTEGER NOT NULL REFERENCES airplanes(id) ON DELETE CASCADE,
    span DECIMAL(8,2) NOT NULL CHECK (span > 0), -- in meters
    material VARCHAR(50) NOT NULL,
    position VARCHAR(20) CHECK (position IN ('left', 'right', 'center')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. ENGINE TABLE (Composition with Airplane)
-- ============================================
CREATE TABLE engines (
    id SERIAL PRIMARY KEY,
    airplane_id INTEGER NOT NULL REFERENCES airplanes(id) ON DELETE CASCADE,
    engine_type VARCHAR(50) NOT NULL,
    horsepower INTEGER NOT NULL CHECK (horsepower > 0),
    serial_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. COCKPIT TABLE (Composition with Airplane)
-- ============================================
CREATE TABLE cockpits (
    id SERIAL PRIMARY KEY,
    airplane_id INTEGER NOT NULL REFERENCES airplanes(id) ON DELETE CASCADE,
    instrument_count INTEGER DEFAULT 0,
    has_autopilot BOOLEAN DEFAULT FALSE,
    layout_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(airplane_id) -- One airplane has exactly one cockpit
);

-- ============================================
-- 6. PILOT TABLE
-- ============================================
CREATE TABLE pilots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. PILOT_OPERATIONS (Association: Pilot operates Airplane)
-- ============================================
CREATE TABLE pilot_operations (
    id SERIAL PRIMARY KEY,
    pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    airplane_id INTEGER NOT NULL REFERENCES airplanes(id) ON DELETE CASCADE,
    operation_date DATE NOT NULL,
    flight_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pilot_id, airplane_id, operation_date, flight_number)
);

-- ============================================
-- 8. PASSENGER TABLE (Aggregation with Airplane)
-- ============================================
CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE,
    nationality VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. PASSENGER_FLIGHTS (Aggregation link)
-- ============================================
CREATE TABLE passenger_flights (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
    airplane_id INTEGER NOT NULL REFERENCES airplanes(id) ON DELETE CASCADE,
    seat_number VARCHAR(10),
    flight_date DATE NOT NULL,
    departure VARCHAR(100),
    arrival VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. NAVIGATION_SYSTEM TABLE (Association with Airplane)
-- ============================================
CREATE TABLE navigation_systems (
    id SERIAL PRIMARY KEY,
    airplane_id INTEGER REFERENCES airplanes(id) ON DELETE SET NULL,
    gps_version VARCHAR(50),
    radar_type VARCHAR(50),
    autopilot_capability BOOLEAN DEFAULT FALSE,
    last_calibration DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(airplane_id) -- One airplane has 0..1 navigation system
);

-- ============================================
-- 11. BIRD TABLE (For Flyable realization)
-- ============================================
CREATE TABLE birds (
    id SERIAL PRIMARY KEY,
    species VARCHAR(100) NOT NULL,
    wingspan DECIMAL(6,2) CHECK (wingspan > 0), -- in cm
    average_weight DECIMAL(6,2), -- in grams
    can_fly BOOLEAN DEFAULT TRUE,
    habitat VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_airplanes_vehicle ON airplanes(vehicle_id);
CREATE INDEX idx_wings_airplane ON wings(airplane_id);
CREATE INDEX idx_engines_airplane ON engines(airplane_id);
CREATE INDEX idx_cockpits_airplane ON cockpits(airplane_id);
CREATE INDEX idx_nav_systems_airplane ON navigation_systems(airplane_id);
CREATE INDEX idx_pilot_operations_pilot ON pilot_operations(pilot_id);
CREATE INDEX idx_pilot_operations_airplane ON pilot_operations(airplane_id);
CREATE INDEX idx_passenger_flights_passenger ON passenger_flights(passenger_id);
CREATE INDEX idx_passenger_flights_airplane ON passenger_flights(airplane_id);

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert Vehicles
INSERT INTO vehicles (brand, year) VALUES 
('Boeing', 2019),
('Airbus', 2020),
('Embraer', 2021),
('Bombardier', 2018);

-- Insert Airplanes
INSERT INTO airplanes (vehicle_id, model, capacity) VALUES 
(1, 'Boeing 737-800', 189),
(2, 'Airbus A320', 180),
(3, 'Embraer E190', 114),
(4, 'Bombardier CRJ900', 90);

-- Insert Wings
INSERT INTO wings (airplane_id, span, material, position) VALUES 
(1, 35.79, 'Aluminum Alloy', 'left'),
(1, 35.79, 'Aluminum Alloy', 'right'),
(2, 35.80, 'Composite', 'left'),
(2, 35.80, 'Composite', 'right'),
(3, 28.72, 'Aluminum', 'left'),
(3, 28.72, 'Aluminum', 'right'),
(4, 24.85, 'Aluminum', 'left'),
(4, 24.85, 'Aluminum', 'right');

-- Insert Engines
INSERT INTO engines (airplane_id, engine_type, horsepower, serial_number) VALUES 
(1, 'CFM56-7B26', 26300, 'CFM001-2024'),
(1, 'CFM56-7B26', 26300, 'CFM002-2024'),
(2, 'V2527-A5', 27000, 'IAE001-2024'),
(2, 'V2527-A5', 27000, 'IAE002-2024'),
(3, 'GE CF34-10E', 18500, 'GE001-2024'),
(4, 'GE CF34-8C5', 14500, 'GE002-2024');

-- Insert Cockpits
INSERT INTO cockpits (airplane_id, instrument_count, has_autopilot, layout_type) VALUES 
(1, 150, TRUE, 'Glass Cockpit'),
(2, 140, TRUE, 'Digital Cockpit'),
(3, 120, TRUE, 'Hybrid Cockpit'),
(4, 110, TRUE, 'Standard Cockpit');

-- Insert Pilots
INSERT INTO pilots (name, license_number, experience_years, phone, email) VALUES 
('John Smith', 'PIL-001-ATPL', 15, '+1-555-0101', 'john.smith@airways.com'),
('Maria Garcia', 'PIL-002-ATPL', 12, '+1-555-0102', 'maria.garcia@airways.com'),
('Ahmed Hassan', 'PIL-003-CPL', 8, '+1-555-0103', 'ahmed.hassan@airways.com'),
('Sarah Johnson', 'PIL-004-ATPL', 20, '+1-555-0104', 'sarah.johnson@airways.com');

-- Insert Pilot Operations
INSERT INTO pilot_operations (pilot_id, airplane_id, operation_date, flight_number) VALUES 
(1, 1, '2024-01-15', 'BA101'),
(1, 1, '2024-01-16', 'BA102'),
(2, 2, '2024-01-15', 'AA201'),
(3, 3, '2024-01-17', 'EM301'),
(4, 4, '2024-01-18', 'BB401');

-- Insert Passengers
INSERT INTO passengers (name, passport_number, date_of_birth, nationality) VALUES 
('Robert Brown', 'P12345678', '1985-03-15', 'American'),
('Emma Wilson', 'P87654321', '1990-07-22', 'British'),
('Carlos Martinez', 'P11223344', '1978-11-30', 'Spanish'),
('Yuki Tanaka', 'P44332211', '1995-05-10', 'Japanese'),
('Pierre Dubois', 'P55667788', '1982-09-05', 'French');

-- Insert Passenger Flights
INSERT INTO passenger_flights (passenger_id, airplane_id, seat_number, flight_date, departure, arrival) VALUES 
(1, 1, '12A', '2024-01-15', 'New York', 'London'),
(2, 2, '15F', '2024-01-16', 'London', 'Paris'),
(3, 1, '22B', '2024-01-15', 'New York', 'London'),
(4, 3, '8C', '2024-01-17', 'Tokyo', 'Osaka'),
(5, 4, '5D', '2024-01-18', 'Paris', 'Berlin');

-- Insert Navigation Systems
INSERT INTO navigation_systems (airplane_id, gps_version, radar_type, autopilot_capability, last_calibration) VALUES 
(1, 'GPS-3000 Pro', 'Weather Radar X1', TRUE, '2024-01-01'),
(2, 'GPS-2500 Elite', 'Doppler Radar D2', TRUE, '2023-12-15'),
(3, 'GPS-2000', 'Standard Radar', TRUE, '2023-11-20'),
(4, 'GPS-1800', 'Basic Radar', FALSE, '2023-10-10');

-- Insert Birds (for Flyable realization)
INSERT INTO birds (species, wingspan, average_weight, can_fly, habitat) VALUES 
('Bald Eagle', 200.00, 4500.00, TRUE, 'North America'),
('Peregrine Falcon', 105.00, 900.00, TRUE, 'Worldwide'),
('Albatross', 350.00, 8000.00, TRUE, 'Southern Ocean'),
('Penguin', 50.00, 3000.00, FALSE, 'Antarctica'),
('Hummingbird', 12.00, 4.00, TRUE, 'Americas');

-- ============================================
-- VIEWS for Common Queries
-- ============================================

-- View: Complete Airplane Information
CREATE OR REPLACE VIEW vw_airplane_details AS
SELECT 
    a.id AS airplane_id,
    v.brand,
    v.year AS manufacture_year,
    a.model,
    a.capacity,
    c.instrument_count,
    c.has_autopilot,
    c.layout_type AS cockpit_type,
    COUNT(DISTINCT w.id) AS wing_count,
    COUNT(DISTINCT e.id) AS engine_count,
    ns.gps_version,
    ns.radar_type,
    ns.autopilot_capability AS nav_autopilot
FROM airplanes a
JOIN vehicles v ON a.vehicle_id = v.id
LEFT JOIN cockpits c ON a.id = c.airplane_id
LEFT JOIN wings w ON a.id = w.airplane_id
LEFT JOIN engines e ON a.id = e.airplane_id
LEFT JOIN navigation_systems ns ON a.id = ns.airplane_id
GROUP BY a.id, v.brand, v.year, a.model, a.capacity, c.instrument_count, c.has_autopilot, c.layout_type, ns.gps_version, ns.radar_type, ns.autopilot_capability;

-- View: Pilot Operations with Details
CREATE OR REPLACE VIEW vw_pilot_operations AS
SELECT 
    po.id AS operation_id,
    p.name AS pilot_name,
    p.license_number,
    p.experience_years,
    a.model AS airplane_model,
    v.brand AS airplane_brand,
    po.operation_date,
    po.flight_number
FROM pilot_operations po
JOIN pilots p ON po.pilot_id = p.id
JOIN airplanes a ON po.airplane_id = a.id
JOIN vehicles v ON a.vehicle_id = v.id;

-- View: Passenger Flight Manifest
CREATE OR REPLACE VIEW vw_flight_manifest AS
SELECT 
    pf.id AS flight_id,
    p.name AS passenger_name,
    p.passport_number,
    p.nationality,
    pf.seat_number,
    pf.flight_date,
    pf.departure,
    pf.arrival,
    a.model AS airplane_model,
    v.brand AS airplane_brand
FROM passenger_flights pf
JOIN passengers p ON pf.passenger_id = p.id
JOIN airplanes a ON pf.airplane_id = a.id
JOIN vehicles v ON a.vehicle_id = v.id;
