-- Workshop Fleet Manager Database Schema
-- Migration: 001_initial_schema
-- Date: 2026-01-16
-- Description: Initial database schema for fleet management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- VEHICLES TABLE
-- Stores all fleet vehicles (horses, reefers, interlinks, ridgets, bakkies)
-- =====================================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fleet_number VARCHAR(10) NOT NULL UNIQUE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('horses', 'reefers', 'interlinks', 'ridgets', 'bakkies')),
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    vin VARCHAR(50),
    registration_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    current_odometer INTEGER DEFAULT 0,
    last_service_date DATE,
    next_service_due DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fleet number lookups
CREATE INDEX idx_vehicles_fleet_number ON vehicles(fleet_number);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- =====================================================
-- INSPECTIONS TABLE
-- Records all vehicle inspections
-- =====================================================
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    fleet_number VARCHAR(10) NOT NULL,
    inspection_type VARCHAR(20) NOT NULL CHECK (inspection_type IN ('daily', 'weekly', 'monthly', 'annual')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'overdue')),
    scheduled_date DATE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    inspector_name VARCHAR(100),
    odometer_reading INTEGER,
    notes TEXT,
    faults_found INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspections_vehicle_id ON inspections(vehicle_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_scheduled_date ON inspections(scheduled_date);

-- =====================================================
-- INSPECTION ITEMS TABLE
-- Individual items checked during an inspection
-- =====================================================
CREATE TABLE inspection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pass', 'fail', 'na', 'pending')),
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspection_items_inspection_id ON inspection_items(inspection_id);

-- =====================================================
-- FAULTS TABLE
-- Records faults found on vehicles
-- =====================================================
CREATE TABLE faults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    fleet_number VARCHAR(10) NOT NULL,
    inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    job_card_id UUID,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in-progress', 'resolved')),
    reported_by VARCHAR(100) NOT NULL,
    reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_date TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faults_vehicle_id ON faults(vehicle_id);
CREATE INDEX idx_faults_status ON faults(status);
CREATE INDEX idx_faults_severity ON faults(severity);

-- =====================================================
-- JOB CARDS TABLE
-- Work orders for maintenance and repairs
-- =====================================================
CREATE TABLE job_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    fleet_number VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('repair', 'maintenance', 'inspection', 'modification')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'pending-parts', 'completed', 'closed')),
    assigned_to VARCHAR(100),
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    labor_cost DECIMAL(10, 2),
    parts_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    start_date DATE,
    due_date DATE,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_cards_vehicle_id ON job_cards(vehicle_id);
CREATE INDEX idx_job_cards_status ON job_cards(status);
CREATE INDEX idx_job_cards_priority ON job_cards(priority);
CREATE INDEX idx_job_cards_job_number ON job_cards(job_number);

-- =====================================================
-- JOB CARD PARTS TABLE
-- Parts used in job cards
-- =====================================================
CREATE TABLE job_card_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_card_id UUID NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
    inventory_item_id UUID,
    part_number VARCHAR(50) NOT NULL,
    part_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'required' CHECK (status IN ('required', 'ordered', 'received', 'installed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_card_parts_job_card_id ON job_card_parts(job_card_id);

-- =====================================================
-- JOB CARD LABOR TABLE
-- Labor entries for job cards
-- =====================================================
CREATE TABLE job_card_labor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_card_id UUID NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
    technician_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    hours DECIMAL(10, 2) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_card_labor_job_card_id ON job_card_labor(job_card_id);

-- =====================================================
-- TYRES TABLE
-- Tyre inventory and tracking
-- =====================================================
CREATE TABLE tyres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    fleet_number VARCHAR(10),
    position VARCHAR(20),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    condition VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'good', 'fair', 'worn', 'replace')),
    tread_depth DECIMAL(5, 2),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    mileage_at_install INTEGER,
    current_mileage INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'in-stock' CHECK (status IN ('in-use', 'in-stock', 'retreading', 'disposed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tyres_vehicle_id ON tyres(vehicle_id);
CREATE INDEX idx_tyres_serial_number ON tyres(serial_number);
CREATE INDEX idx_tyres_status ON tyres(status);
CREATE INDEX idx_tyres_condition ON tyres(condition);

-- =====================================================
-- TYRE HISTORY TABLE
-- Track all tyre movements and actions
-- =====================================================
CREATE TABLE tyre_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tyre_id UUID NOT NULL REFERENCES tyres(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('install', 'rotate', 'remove', 'inspect', 'retread', 'dispose')),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    fleet_number VARCHAR(10),
    position VARCHAR(20),
    odometer_reading INTEGER,
    tread_depth DECIMAL(5, 2),
    notes TEXT,
    performed_by VARCHAR(100) NOT NULL,
    performed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tyre_history_tyre_id ON tyre_history(tyre_id);
CREATE INDEX idx_tyre_history_vehicle_id ON tyre_history(vehicle_id);

-- =====================================================
-- INVENTORY ITEMS TABLE
-- Parts and supplies inventory
-- =====================================================
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    supplier VARCHAR(200),
    location VARCHAR(100),
    last_ordered DATE,
    last_used DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_part_number ON inventory_items(part_number);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);

-- =====================================================
-- INVENTORY TRANSACTIONS TABLE
-- Track inventory movements
-- =====================================================
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    job_card_id UUID REFERENCES job_cards(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    fleet_number VARCHAR(10),
    notes TEXT,
    performed_by VARCHAR(100) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(inventory_item_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- =====================================================
-- SCHEDULED MAINTENANCE TABLE
-- Recurring maintenance schedules
-- =====================================================
CREATE TABLE scheduled_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    fleet_number VARCHAR(10) NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    frequency_type VARCHAR(20) NOT NULL CHECK (frequency_type IN ('mileage', 'time', 'both')),
    frequency_mileage INTEGER,
    frequency_days INTEGER,
    last_performed_date DATE,
    last_performed_mileage INTEGER,
    next_due_date DATE,
    next_due_mileage INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_maintenance_vehicle_id ON scheduled_maintenance(vehicle_id);
CREATE INDEX idx_scheduled_maintenance_status ON scheduled_maintenance(status);

-- =====================================================
-- PURCHASE RECORDS TABLE
-- Track all purchases for vehicles
-- =====================================================
CREATE TABLE purchase_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    fleet_number VARCHAR(10) NOT NULL,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('part', 'tyre', 'service', 'fuel', 'other')),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    supplier VARCHAR(200),
    invoice_number VARCHAR(50),
    purchase_date DATE NOT NULL,
    job_card_id UUID REFERENCES job_cards(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_purchase_records_vehicle_id ON purchase_records(vehicle_id);
CREATE INDEX idx_purchase_records_purchase_date ON purchase_records(purchase_date);

-- =====================================================
-- TRIGGERS
-- Automatic timestamp updates
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faults_updated_at BEFORE UPDATE ON faults FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_cards_updated_at BEFORE UPDATE ON job_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tyres_updated_at BEFORE UPDATE ON tyres FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_maintenance_updated_at BEFORE UPDATE ON scheduled_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
-- =====================================================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE faults ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_card_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_card_labor ENABLE ROW LEVEL SECURITY;
ALTER TABLE tyres ENABLE ROW LEVEL SECURITY;
ALTER TABLE tyre_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_records ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (allow all operations for now)
-- These can be refined later based on specific role requirements

CREATE POLICY "Allow all for authenticated users" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON inspection_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON faults FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON job_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON job_card_parts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON job_card_labor FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON tyres FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON tyre_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON inventory_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON scheduled_maintenance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON purchase_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
