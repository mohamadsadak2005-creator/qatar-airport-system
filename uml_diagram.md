# UML Class Diagram - Airplane Management System

## Classes and Relationships

### 1. Vehicle (Abstract Base Class)
```
┌─────────────────────┐
│      Vehicle        │
├─────────────────────┤
│ - id: INT           │
│ - brand: VARCHAR    │
│ - year: INT         │
├─────────────────────┤
│ + start()           │
│ + stop()            │
└─────────────────────┘
```

### 2. Airplane (Inherits from Vehicle)
```
┌─────────────────────┐
│      Airplane       │
├─────────────────────┤
│ - id: INT           │
│ - model: VARCHAR    │
│ - capacity: INT     │
│ - vehicle_id: FK    │
├─────────────────────┤
│ + fly()             │
│ + land()            │
└─────────────────────┘
```
**Relationship:** Inheritance (Airplane IS-A Vehicle)

### 3. Wing (Composition with Airplane)
```
┌─────────────────────┐
│        Wing         │
├─────────────────────┤
│ - id: INT           │
│ - span: FLOAT       │
│ - material: VARCHAR │
│ - airplane_id: FK   │
└─────────────────────┘
```
**Relationship:** Composition (Airplane consists of Wings)
- Multiplicity: 1..2 (One airplane has 1-2 wings)
- Solid diamond connector

### 4. Engine (Composition with Airplane)
```
┌─────────────────────┐
│       Engine        │
├─────────────────────┤
│ - id: INT           │
│ - type: VARCHAR     │
│ - horsepower: INT   │
│ - airplane_id: FK   │
└─────────────────────┘
```
**Relationship:** Composition (Airplane consists of Engines)
- Multiplicity: 1..4 (One airplane has 1-4 engines)
- Solid diamond connector

### 5. Cockpit (Composition with Airplane)
```
┌─────────────────────┐
│       Cockpit       │
├─────────────────────┤
│ - id: INT           │
│ - instrument_count  │
│ - has_autopilot     │
│ - airplane_id: FK   │
└─────────────────────┘
```
**Relationship:** Composition (Airplane consists of Cockpit)
- Multiplicity: 1 (One airplane has exactly 1 cockpit)
- Solid diamond connector

### 6. Pilot (Association with Airplane)
```
┌─────────────────────┐
│       Pilot         │
├─────────────────────┤
│ - id: INT           │
│ - name: VARCHAR     │
│ - license_num       │
│ - experience_years  │
├─────────────────────┤
│ + operate()         │
└─────────────────────┘
```
**Relationship:** Association (Pilot operates Airplane)
- Multiplicity: 1..* Pilots to 0..* Airplanes
- Simple line connector
- Junction table: pilot_airplane_operations

### 7. Passenger (Aggregation with Airplane)
```
┌─────────────────────┐
│     Passenger       │
├─────────────────────┤
│ - id: INT           │
│ - name: VARCHAR     │
│ - passport_num      │
│ - seat_number       │
├─────────────────────┤
│ + board()           │
│ + disembark()       │
└─────────────────────┘
```
**Relationship:** Aggregation (Airplane carries Passengers)
- Multiplicity: 0..* Passengers to 0..1 Airplane
- Empty diamond connector
- Foreign key on Passenger table

### 8. NavigationSystem (Association/Dependency with Airplane)
```
┌─────────────────────┐
│  NavigationSystem   │
├─────────────────────┤
│ - id: INT           │
│ - gps_version       │
│ - radar_type        │
│ - airplane_id: FK   │
└─────────────────────┘
```
**Relationship:** Association (Airplane uses NavigationSystem)
- Multiplicity: 1 Airplane to 0..1 NavigationSystem
- Dashed line connector or simple line

### 9. Flyable (Interface - Realization)
```
┌─────────────────────┐
│      Flyable        │
├─────────────────────┤
│ <<interface>>       │
├─────────────────────┤
│ + fly()             │
│ + land()            │
└─────────────────────┘
```
**Relationship:** Realization (Airplane implements Flyable, Bird implements Flyable)
- Dashed line with hollow triangle
- Airplane can fly like a Bird

### 10. Bird (Implements Flyable)
```
┌─────────────────────┐
│        Bird         │
├─────────────────────┤
│ - id: INT           │
│ - species: VARCHAR  │
│ - wingspan: FLOAT   │
├─────────────────────┤
│ + fly()             │
│ + land()            │
└─────────────────────┘
```

## Complete UML Diagram Structure

```
                    ┌─────────────┐
                    │  <<interface>>  │
                    │   Flyable   │
                    │─────────────│
                    │ + fly()     │
                    │ + land()    │
                    └──────┬──────┘
                           △ (realization)
            ┌──────────────┴──────────────┐
            │                             │
     ┌──────┴──────┐              ┌──────┴──────┐
     │  Airplane   │              │    Bird     │
     │─────────────│              │─────────────│
     │ model       │              │ species     │
     │ capacity    │              │ wingspan    │
     └──────┬──────┘              └─────────────┘
            │
            │ (inheritance)
            △
     ┌──────┴──────┐
     │   Vehicle   │
     │─────────────│
     │ brand       │
     │ year        │
     └─────────────┘
```

## Relationships Summary Table

| Relationship | Type | From | To | Multiplicity |
|--------------|------|------|-----|--------------|
| Inheritance | Generalization | Airplane | Vehicle | 1-to-1 |
| Composition | Strong aggregation | Airplane | Wing | 1-to-1..2 |
| Composition | Strong aggregation | Airplane | Engine | 1-to-1..4 |
| Composition | Strong aggregation | Airplane | Cockpit | 1-to-1 |
| Association | Simple | Pilot | Airplane | *-to-* |
| Aggregation | Weak aggregation | Airplane | Passenger | 1-to-0..* |
| Association | Simple | Airplane | NavigationSystem | 1-to-0..1 |
| Realization | Interface | Airplane | Flyable | implements |
| Realization | Interface | Bird | Flyable | implements |
