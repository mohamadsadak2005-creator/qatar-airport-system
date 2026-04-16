# ✈️ Qatar Airport Management System

A complete **Hamad International Airport** themed web application for managing an airplane fleet, built with **PHP 8.5.5**, **PostgreSQL**, **HTML5**, **CSS3**, and **JavaScript**. This project features a stunning **Qatari burgundy and gold** design with professional animations and modern UI/UX.

![Qatar Airport Theme](assets/images/logo.svg)

## 🎨 Premium Features

### 🌟 Visual Design
- **Qatari Theme**: Burgundy (#722f37) and Gold (#d4a84b) color palette
- **Professional Logo**: SVG vector logo with airport tower, runway, and airplane
- **Animated Background**: Slideshow with 3 Qatar airport images
- **Glassmorphism Effects**: Modern frosted glass UI elements
- **Particle System**: Floating golden particles animation

### 🌙 Theme System
- **Dark Mode**: Qatar burgundy theme (default)
- **Light Mode**: Black & Gold theme
- **Auto-save**: Theme preference stored in localStorage
- **Smooth Transitions**: CSS transitions between themes

### ✨ Interactive Features
- **Digital Clock**: Qatar timezone (Asia/Qatar) with date
- **Toast Notifications**: Professional notifications with icons
- **Flight Status Simulator**: Real-time flight status badges
- **Typewriter Effect**: Animated text on headings
- **Scroll Progress**: Golden progress bar at top
- **Weather Widget**: Doha weather display
- **Splash Screen**: Animated logo on page load

### 🖼️ Background Slideshow
- 3 rotating background images from Qatar airport
- Ken Burns zoom effect
- Navigation dots for manual control
- Play/Pause toggle button
- Dark overlay for text readability

## Project Overview

This project fulfills a practical assignment on Object-Oriented Modeling and Database Design, transforming a UML class diagram into a relational database schema and implementing a full CRUD web application.

## UML Class Diagram Implementation

The system implements the following UML relationships as specified:

| Relationship | Type | Implementation |
|--------------|------|----------------|
| **Inheritance** | Generalization | `Vehicle` (base) → `Airplane` (derived) via foreign key |
| **Composition** | Strong aggregation | `Airplane` → `Wing`, `Engine`, `Cockpit` (cascade delete) |
| **Aggregation** | Weak aggregation | `Airplane` → `Passenger` via `passenger_flights` table |
| **Association** | Simple | `Pilot` → `Airplane` via `pilot_operations` table |
| **Association** | Simple | `Airplane` → `NavigationSystem` (0..1) |
| **Realization** | Interface | `Flyable` → implemented by `Airplane` and `Bird` |

## Project Structure

```
TP5/
├── index.php              # Dashboard with statistics
├── airplanes.php          # Airplane CRUD operations
├── pilots.php             # Pilot management and operations
├── passengers.php         # Passenger management and bookings
├── components.php         # Wings, engines, cockpits, nav systems
├── config/
│   └── database.php       # PostgreSQL connection
├── includes/
│   ├── header.php         # Navigation template
│   └── footer.php         # Footer template
├── assets/
│   ├── css/
│   │   └── style.css      # Modern, responsive styling
│   └── js/
│       └── app.js         # Interactive functionality
├── database_schema.sql    # Complete PostgreSQL schema
├── uml_diagram.md         # UML documentation
└── README.md              # This file
```

## Technologies Used

- **Backend**: PHP 8.0+
- **Database**: PostgreSQL 12+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Font Awesome 6

## Database Schema

### Tables

1. **vehicles** - Base class for inheritance
2. **airplanes** - Inherits from vehicles (1:1 relationship)
3. **wings** - Composition with airplane (cascade delete)
4. **engines** - Composition with airplane (cascade delete)
5. **cockpits** - Composition with airplane (1:1, cascade delete)
6. **pilots** - Pilot information
7. **pilot_operations** - Association (pilot-airplane operations)
8. **passengers** - Passenger information
9. **passenger_flights** - Aggregation (passenger bookings)
10. **navigation_systems** - Association with airplane
11. **birds** - Flyable interface implementation

## Setup Instructions

### Prerequisites

- PHP 8.0 or higher
- PostgreSQL 12 or higher
- Web server (Apache/Nginx) or PHP built-in server

### Database Setup

1. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE airplane_management;
   ```

2. **Update database configuration:**
   Edit `config/database.php` with your PostgreSQL credentials:
   ```php
   define('DB_PASSWORD', 'your_actual_password');
   ```

3. **Run the schema:**
   ```bash
   psql -U postgres -d airplane_management -f database_schema.sql
   ```

### Web Server Setup

**Option 1: PHP Built-in Server (Development)**
```bash
cd TP5
php -S localhost:8000
```

**Option 2: Apache/XAMPP (Production)**
Copy the project folder to your web server's document root (e.g., `htdocs` for XAMPP).

### Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```
or
```
http://localhost/TP5
```

## Features

### Dashboard
- Real-time statistics (airplanes, pilots, passengers, flights)
- Quick access to all modules
- Recent activity display
- System information

### Airplane Management
- Add, edit, delete airplanes
- Manage wings (composition)
- Manage engines (composition)
- Automatic cockpit creation

### Pilot Management
- Add, edit, delete pilots
- Assign operations to airplanes (association)
- Track flight history

### Passenger Management
- Add, edit, delete passengers
- Book flights (aggregation)
- Track travel history

### Components Management
- View and manage wings
- View and manage engines
- Update cockpit settings
- Update navigation systems
- Manage birds (Flyable demonstration)

## UML Relationships Explained

### 1. Inheritance (Vehicle → Airplane)
- Each airplane has a corresponding vehicle record
- Vehicle attributes: brand, year
- Airplane attributes: model, capacity

### 2. Composition (Airplane → Components)
- Wings, engines, and cockpits cannot exist without their airplane
- Cascade delete ensures components are removed when airplane is deleted
- Strong ownership relationship

### 3. Aggregation (Airplane → Passengers)
- Passengers can exist independently
- Linked via `passenger_flights` junction table
- Passengers can fly on multiple airplanes

### 4. Association (Pilot → Airplane)
- Pilots operate multiple airplanes
- Operations tracked in `pilot_operations` table
- Many-to-many relationship

### 5. Realization (Flyable Interface)
- Birds and Airplanes both implement Flyable
- Demonstrates polymorphism concept
- Birds table represents the Flyable implementation

## Screenshots

The application features a modern, responsive design with:
- Gradient backgrounds
- Card-based layout
- Modal dialogs for CRUD operations
- Interactive tables with search
- Mobile-friendly responsive design

## Security Considerations

- SQL injection prevention via prepared statements
- XSS protection via htmlspecialchars encoding
- CSRF tokens can be added for production use

## Future Enhancements

- User authentication system
- Flight scheduling module
- Maintenance tracking
- Reporting and analytics
- API for mobile applications

## License

This project is for educational purposes as part of a practical work assignment.

## App developer 
كMS
MADOUI MOHAMED SADEK- Object-Oriented Modeling & Database Design 
