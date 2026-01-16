-- Workshop Fleet Manager - Seed Data
-- Migration: 002_seed_data
-- Date: 2026-01-16
-- Description: Initial seed data for the fleet management system

-- =====================================================
-- SEED VEHICLES
-- Insert all fleet vehicles
-- =====================================================

-- HORSES (Truck tractors / Prime movers)
INSERT INTO vehicles (fleet_number, category, status, make, model) VALUES
    ('21H', 'horses', 'active', 'Scania', 'R500'),
    ('22H', 'horses', 'active', 'Scania', 'R500'),
    ('23H', 'horses', 'active', 'Volvo', 'FH16'),
    ('24H', 'horses', 'active', 'Volvo', 'FH16'),
    ('26H', 'horses', 'active', 'Mercedes-Benz', 'Actros'),
    ('28H', 'horses', 'active', 'Mercedes-Benz', 'Actros'),
    ('31H', 'horses', 'active', 'MAN', 'TGX'),
    ('32H', 'horses', 'active', 'MAN', 'TGX'),
    ('33H', 'horses', 'active', 'Scania', 'R450'),
    ('34H', 'horses', 'active', 'Scania', 'R450');

-- REEFERS (Refrigerated trailers)
INSERT INTO vehicles (fleet_number, category, status, make, model) VALUES
    ('4F', 'reefers', 'active', 'Serco', 'Tri-Axle Reefer'),
    ('5F', 'reefers', 'active', 'Serco', 'Tri-Axle Reefer'),
    ('6F', 'reefers', 'active', 'Afrit', 'Reefer Trailer'),
    ('7F', 'reefers', 'active', 'Afrit', 'Reefer Trailer'),
    ('8F', 'reefers', 'active', 'Henred', 'Reefer'),
    ('9F', 'reefers', 'active', 'Henred', 'Reefer');

-- INTERLINKS (Interlink trailers)
INSERT INTO vehicles (fleet_number, category, status, make, model) VALUES
    ('1T', 'interlinks', 'active', 'SA Truck Bodies', 'Interlink'),
    ('2T', 'interlinks', 'active', 'SA Truck Bodies', 'Interlink'),
    ('3T', 'interlinks', 'active', 'Afrit', 'Interlink'),
    ('4T', 'interlinks', 'active', 'Afrit', 'Interlink');

-- RIDGETS (Rigid body trucks)
INSERT INTO vehicles (fleet_number, category, status, make, model) VALUES
    ('1H', 'ridgets', 'active', 'Isuzu', 'FTR 850'),
    ('4H', 'ridgets', 'active', 'Isuzu', 'FTR 850'),
    ('6H', 'ridgets', 'active', 'Hino', '500 Series'),
    ('29H', 'ridgets', 'active', 'Hino', '500 Series'),
    ('30H', 'ridgets', 'active', 'UD Trucks', 'Quester');

-- BAKKIES (Light delivery vehicles)
INSERT INTO vehicles (fleet_number, category, status, make, model) VALUES
    ('14L', 'bakkies', 'active', 'Toyota', 'Hilux'),
    ('15L', 'bakkies', 'active', 'Toyota', 'Hilux'),
    ('16L', 'bakkies', 'active', 'Ford', 'Ranger'),
    ('17L', 'bakkies', 'active', 'Ford', 'Ranger');

-- =====================================================
-- SEED INVENTORY CATEGORIES
-- Common parts and supplies
-- =====================================================

INSERT INTO inventory_items (part_number, name, category, quantity_in_stock, minimum_stock, unit_price, location) VALUES
    -- Filters
    ('FLT-OIL-001', 'Oil Filter - Scania R Series', 'Filters', 15, 5, 450.00, 'Shelf A1'),
    ('FLT-OIL-002', 'Oil Filter - Volvo FH', 'Filters', 12, 5, 480.00, 'Shelf A1'),
    ('FLT-OIL-003', 'Oil Filter - Mercedes Actros', 'Filters', 10, 5, 520.00, 'Shelf A1'),
    ('FLT-AIR-001', 'Air Filter - Scania R Series', 'Filters', 8, 3, 890.00, 'Shelf A2'),
    ('FLT-AIR-002', 'Air Filter - Volvo FH', 'Filters', 6, 3, 920.00, 'Shelf A2'),
    ('FLT-FUEL-001', 'Fuel Filter - Universal HD', 'Filters', 20, 10, 380.00, 'Shelf A3'),
    
    -- Brake Components
    ('BRK-PAD-001', 'Brake Pads - Front Axle HD', 'Brakes', 8, 4, 2800.00, 'Shelf B1'),
    ('BRK-PAD-002', 'Brake Pads - Rear Axle HD', 'Brakes', 6, 4, 3200.00, 'Shelf B1'),
    ('BRK-DISC-001', 'Brake Disc - Front', 'Brakes', 4, 2, 4500.00, 'Shelf B2'),
    ('BRK-SHOE-001', 'Brake Shoes - Trailer', 'Brakes', 12, 6, 1800.00, 'Shelf B3'),
    
    -- Lights
    ('LGT-HEAD-001', 'Headlight Assembly - Universal', 'Lights', 6, 2, 1200.00, 'Shelf C1'),
    ('LGT-TAIL-001', 'Tail Light LED - Trailer', 'Lights', 10, 4, 450.00, 'Shelf C1'),
    ('LGT-INDI-001', 'Indicator Lamp - Side', 'Lights', 20, 10, 120.00, 'Shelf C2'),
    ('LGT-WORK-001', 'Work Light LED', 'Lights', 8, 4, 680.00, 'Shelf C2'),
    
    -- Fluids
    ('FLD-OIL-001', 'Engine Oil 15W-40 - 20L', 'Fluids', 25, 10, 1850.00, 'Bay D1'),
    ('FLD-COOL-001', 'Coolant Concentrate - 20L', 'Fluids', 15, 5, 890.00, 'Bay D1'),
    ('FLD-BRK-001', 'Brake Fluid DOT 4 - 5L', 'Fluids', 10, 5, 420.00, 'Bay D2'),
    ('FLD-HYD-001', 'Hydraulic Oil - 20L', 'Fluids', 8, 3, 1450.00, 'Bay D2'),
    
    -- Belts & Hoses
    ('BLT-FAN-001', 'Fan Belt - Scania', 'Belts', 6, 3, 380.00, 'Shelf E1'),
    ('BLT-ALT-001', 'Alternator Belt - Universal', 'Belts', 8, 4, 290.00, 'Shelf E1'),
    ('HOS-RAD-001', 'Radiator Hose - Upper', 'Hoses', 5, 2, 520.00, 'Shelf E2'),
    ('HOS-AIR-001', 'Air Brake Hose - 1m', 'Hoses', 15, 5, 180.00, 'Shelf E2'),
    
    -- Electrical
    ('ELC-BAT-001', 'Battery 12V 200Ah HD', 'Electrical', 4, 2, 3800.00, 'Bay F1'),
    ('ELC-ALT-001', 'Alternator - Recon HD', 'Electrical', 2, 1, 4500.00, 'Shelf F2'),
    ('ELC-STR-001', 'Starter Motor - Recon HD', 'Electrical', 2, 1, 5200.00, 'Shelf F2'),
    
    -- Suspension
    ('SUS-SPR-001', 'Leaf Spring - Front', 'Suspension', 4, 2, 2800.00, 'Bay G1'),
    ('SUS-AIR-001', 'Air Bag - Rear Suspension', 'Suspension', 6, 2, 3200.00, 'Bay G1'),
    ('SUS-SHK-001', 'Shock Absorber - HD', 'Suspension', 8, 4, 1800.00, 'Bay G2');

-- =====================================================
-- SEED SCHEDULED MAINTENANCE TEMPLATES
-- Default maintenance schedules for vehicles
-- =====================================================

-- Create maintenance schedules for all horses
INSERT INTO scheduled_maintenance (vehicle_id, fleet_number, maintenance_type, description, frequency_type, frequency_mileage, frequency_days, status)
SELECT 
    id,
    fleet_number,
    'Oil & Filter Change',
    'Engine oil and filter replacement',
    'both',
    15000,
    90,
    'upcoming'
FROM vehicles WHERE category = 'horses';

INSERT INTO scheduled_maintenance (vehicle_id, fleet_number, maintenance_type, description, frequency_type, frequency_mileage, frequency_days, status)
SELECT 
    id,
    fleet_number,
    'Full Service',
    'Complete vehicle service including all filters, fluids, and inspection',
    'both',
    45000,
    180,
    'upcoming'
FROM vehicles WHERE category = 'horses';

INSERT INTO scheduled_maintenance (vehicle_id, fleet_number, maintenance_type, description, frequency_type, frequency_days, status)
SELECT 
    id,
    fleet_number,
    'Annual COF',
    'Certificate of Fitness inspection and renewal',
    'time',
    365,
    'upcoming'
FROM vehicles WHERE category IN ('horses', 'ridgets');

-- Reefer specific maintenance
INSERT INTO scheduled_maintenance (vehicle_id, fleet_number, maintenance_type, description, frequency_type, frequency_days, status)
SELECT 
    id,
    fleet_number,
    'Refrigeration Unit Service',
    'Reefer unit inspection, gas check, and service',
    'time',
    90,
    'upcoming'
FROM vehicles WHERE category = 'reefers';

-- Trailer brake inspection
INSERT INTO scheduled_maintenance (vehicle_id, fleet_number, maintenance_type, description, frequency_type, frequency_days, status)
SELECT 
    id,
    fleet_number,
    'Brake Inspection',
    'Full brake system inspection and adjustment',
    'time',
    60,
    'upcoming'
FROM vehicles WHERE category IN ('reefers', 'interlinks');
