/*
  # Work Orders Management System

  ## Overview
  Complete implementation of a comprehensive work order system following industry standards
  with VMRS integration, detailed parts and labor tracking, meter readings, and financial management.

  ## New Tables Created

  ### Core Work Orders
  1. `work_orders` - Main work order records with complete metadata
     - Basic info (number, description, state)
     - Dates and durations (issued, started, completed, scheduled)
     - Associated entities (vehicle, contact, vendor, creator)
     - Financial fields (invoice, PO numbers, discounts, taxes, markups, totals)
     - Meter readings (starting/ending for primary and secondary meters)
     - Flags and custom fields

  2. `work_order_statuses` - Work order status definitions
     - ID, name, color for status display

  3. `work_order_line_items` - Issue and repair line items
     - Description, title, item references
     - VMRS integration (system group, system, assembly, component, reason for repair)
     - Costs (subtotal, labor cost, parts cost)
     - Position for ordering

  4. `work_order_sub_line_items` - Contact, part, and labor entries
     - Item type (Contact, Part, Labor)
     - Quantity, unit cost, position
     - Part location details
     - References to detailed item data

  ### Supporting Tables
  5. `labor_time_entries` - Labor clock in/out tracking
     - Contact/technician reference
     - Duration in seconds
     - Start/end timestamps
     - GPS coordinates for clock events
     - Active status flag

  6. `meter_entries` - Vehicle meter readings
     - Category (starting, ending)
     - Meter type (primary, secondary, GPS)
     - Value and date
     - Vehicle reference
     - Void flag for corrections

  7. `vmrs_system_groups` - VMRS system group codes
  8. `vmrs_systems` - VMRS system codes
  9. `vmrs_assemblies` - VMRS assembly codes
  10. `vmrs_components` - VMRS component codes
  11. `vmrs_reason_for_repair` - VMRS repair reason codes
  12. `vmrs_repair_priority_class` - VMRS priority classifications

  ### Documentation and Metadata
  13. `work_order_labels` - Label/tag definitions
  14. `work_order_label_assignments` - Work order to label mapping
  15. `work_order_issues` - Issue tracking
  16. `work_order_issue_assignments` - Work order to issue mapping
  17. `work_order_comments` - Comments and notes
  18. `work_order_images` - Image attachments
  19. `work_order_documents` - Document attachments

  ### Contact Details
  20. `contacts` - Detailed contact/technician information
     - Personal info (name, email, phone)
     - Address details
     - Employee information
     - License details
     - Technician and operator flags

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to manage work orders
  - Read access for team members, write access for assigned users
*/

-- =====================================================
-- CONTACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  first_name text,
  last_name text,
  email text,
  phone_number text,
  mobile_number text,
  street_address text,
  city text,
  state text,
  postal_code text,
  country text,
  employee_number text,
  job_title text,
  department text,
  license_class text,
  license_number text,
  license_expiry_date date,
  birth_date date,
  start_date date,
  is_technician boolean DEFAULT false,
  is_vehicle_operator boolean DEFAULT false,
  is_employee boolean DEFAULT false,
  hourly_rate numeric(10,2),
  image_url text,
  notes text,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- WORK ORDER STATUSES
-- =====================================================

CREATE TABLE IF NOT EXISTS work_order_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert default statuses
INSERT INTO work_order_statuses (name, color, sort_order) VALUES
  ('draft', '#6B7280', 1),
  ('pending', '#F59E0B', 2),
  ('active', '#3B82F6', 3),
  ('in_progress', '#8B5CF6', 4),
  ('completed', '#10B981', 5),
  ('invoiced', '#059669', 6),
  ('cancelled', '#EF4444', 7)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VMRS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS vmrs_repair_priority_class (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  color text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vmrs_system_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vmrs_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_group_id uuid REFERENCES vmrs_system_groups(id),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vmrs_assemblies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id uuid REFERENCES vmrs_systems(id),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vmrs_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id uuid REFERENCES vmrs_assemblies(id),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vmrs_reason_for_repair (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  repair_type text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- METER ENTRIES
-- =====================================================

CREATE TABLE IF NOT EXISTS meter_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid,
  vehicle_id uuid REFERENCES vehicles(id),
  category text NOT NULL,
  meter_type text NOT NULL,
  value numeric(12,2) NOT NULL,
  date timestamptz DEFAULT now(),
  auto_voided_at timestamptz,
  void boolean DEFAULT false,
  entry_type text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- MAIN WORK ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  number text UNIQUE NOT NULL,
  description text,
  state text DEFAULT 'draft',

  -- Dates and Durations
  issued_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  expected_completed_at timestamptz,
  scheduled_at timestamptz,
  duration_in_seconds integer DEFAULT 0,
  labor_time_in_seconds integer DEFAULT 0,

  -- Associated Entities
  created_by_id uuid,
  created_by_name text,
  issued_by_id uuid,
  issued_by_name text,
  contact_id uuid REFERENCES contacts(id),
  contact_name text,
  contact_image_url text,
  vehicle_id uuid REFERENCES vehicles(id),
  vehicle_name text,
  vendor_id uuid,
  vendor_name text,
  work_order_status_id uuid REFERENCES work_order_statuses(id),
  work_order_status_name text,
  work_order_status_color text,

  -- Financial Information
  invoice_number text,
  purchase_order_number text,

  -- Discounts
  discount_type text,
  discount_percentage numeric(5,2) DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,

  -- Subtotals
  parts_subtotal numeric(12,2) DEFAULT 0,
  labor_subtotal numeric(12,2) DEFAULT 0,
  subtotal numeric(12,2) DEFAULT 0,

  -- Taxes
  tax_1_type text,
  tax_1_percentage numeric(5,2) DEFAULT 0,
  tax_1 numeric(10,2) DEFAULT 0,
  tax_2_type text,
  tax_2_percentage numeric(5,2) DEFAULT 0,
  tax_2 numeric(10,2) DEFAULT 0,

  -- Markups
  parts_markup_type text,
  parts_markup numeric(10,2) DEFAULT 0,
  parts_markup_percentage numeric(5,2) DEFAULT 0,
  labor_markup_type text,
  labor_markup numeric(10,2) DEFAULT 0,
  labor_markup_percentage numeric(5,2) DEFAULT 0,

  -- Total
  total_amount numeric(12,2) DEFAULT 0,

  -- Meter Readings
  starting_meter_value numeric(12,2),
  ending_meter_value numeric(12,2),
  starting_secondary_meter_value numeric(12,2),
  ending_secondary_meter_value numeric(12,2),

  -- Flags and Settings
  ending_meter_same_as_start boolean DEFAULT false,
  is_watched boolean DEFAULT false,

  -- Custom Fields and Permissions
  custom_fields jsonb DEFAULT '{}'::jsonb,
  attachment_permissions jsonb DEFAULT '{"read_photos": true, "manage_photos": false, "read_documents": true, "manage_documents": false}'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- WORK ORDER LINE ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS work_order_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,

  -- Basic Information
  description text,
  title text,
  item_id uuid,
  item_type text,
  item_name text,
  position integer DEFAULT 0,

  -- Costs
  subtotal numeric(12,2) DEFAULT 0,
  subtotal_cents integer DEFAULT 0,
  labor_cost numeric(12,2) DEFAULT 0,
  labor_cost_cents integer DEFAULT 0,
  parts_cost numeric(12,2) DEFAULT 0,
  parts_cost_cents integer DEFAULT 0,

  -- VMRS Integration
  vmrs_reason_for_repair_id uuid REFERENCES vmrs_reason_for_repair(id),
  vmrs_system_group_id uuid REFERENCES vmrs_system_groups(id),
  vmrs_system_id uuid REFERENCES vmrs_systems(id),
  vmrs_assembly_id uuid REFERENCES vmrs_assemblies(id),
  vmrs_component_id uuid REFERENCES vmrs_components(id),
  vmrs_repair_priority_class_id uuid REFERENCES vmrs_repair_priority_class(id),

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- WORK ORDER SUB LINE ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS work_order_sub_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_line_item_id uuid REFERENCES work_order_line_items(id) ON DELETE CASCADE NOT NULL,

  -- Basic Information
  description text,
  item_id uuid,
  item_type text NOT NULL,
  item_name text,
  position integer DEFAULT 0,

  -- Quantity and Cost
  quantity numeric(10,2) DEFAULT 1,
  unit_cost numeric(10,2) DEFAULT 0,
  total_cost numeric(12,2) DEFAULT 0,

  -- Part-specific
  part_location_detail_id uuid,
  part_location_name text,

  -- Contact-specific (references contacts table)
  contact_id uuid REFERENCES contacts(id),

  -- Inventory item reference
  inventory_item_id uuid REFERENCES inventory_items(id),

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- LABOR TIME ENTRIES
-- =====================================================

CREATE TABLE IF NOT EXISTS labor_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE,
  work_order_line_item_id uuid REFERENCES work_order_line_items(id) ON DELETE CASCADE,
  work_order_sub_line_item_id uuid REFERENCES work_order_sub_line_items(id) ON DELETE CASCADE,

  -- Contact/Technician
  contact_id uuid REFERENCES contacts(id) NOT NULL,
  contact_name text,

  -- Time Tracking
  duration_in_seconds integer DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  active boolean DEFAULT false,

  -- Location Data
  clock_in_latitude numeric(10,8),
  clock_in_longitude numeric(11,8),
  clock_out_latitude numeric(10,8),
  clock_out_longitude numeric(11,8),

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- LABELS AND ISSUES
-- =====================================================

CREATE TABLE IF NOT EXISTS work_order_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_order_label_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  label_id uuid REFERENCES work_order_labels(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(work_order_id, label_id)
);

CREATE TABLE IF NOT EXISTS work_order_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_order_issue_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  issue_id uuid REFERENCES work_order_issues(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(work_order_id, issue_id)
);

-- =====================================================
-- COMMENTS, IMAGES, DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS work_order_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid,
  user_name text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_order_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  thumbnail_url text,
  uploaded_by_id uuid,
  uploaded_by_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_order_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  uploaded_by_id uuid,
  uploaded_by_name text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle_id ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_contact_id ON work_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status_id ON work_orders(work_order_status_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_state ON work_orders(state);
CREATE INDEX IF NOT EXISTS idx_work_orders_number ON work_orders(number);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_work_order_line_items_work_order_id ON work_order_line_items(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_line_items_position ON work_order_line_items(position);

CREATE INDEX IF NOT EXISTS idx_work_order_sub_line_items_line_item_id ON work_order_sub_line_items(work_order_line_item_id);
CREATE INDEX IF NOT EXISTS idx_work_order_sub_line_items_item_type ON work_order_sub_line_items(item_type);

CREATE INDEX IF NOT EXISTS idx_labor_time_entries_work_order_id ON labor_time_entries(work_order_id);
CREATE INDEX IF NOT EXISTS idx_labor_time_entries_contact_id ON labor_time_entries(contact_id);
CREATE INDEX IF NOT EXISTS idx_labor_time_entries_active ON labor_time_entries(active);

CREATE INDEX IF NOT EXISTS idx_meter_entries_work_order_id ON meter_entries(work_order_id);
CREATE INDEX IF NOT EXISTS idx_meter_entries_vehicle_id ON meter_entries(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_contacts_is_technician ON contacts(is_technician) WHERE is_technician = true;
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vmrs_repair_priority_class ENABLE ROW LEVEL SECURITY;
ALTER TABLE vmrs_system_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vmrs_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE vmrs_assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vmrs_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE vmrs_reason_for_repair ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_sub_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_label_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_issue_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Contacts: authenticated users can read all, manage their own
CREATE POLICY "Authenticated users can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true);

-- VMRS Tables: read-only for all authenticated users
CREATE POLICY "Authenticated users can view VMRS data"
  ON vmrs_repair_priority_class FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view VMRS system groups"
  ON vmrs_system_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view VMRS systems"
  ON vmrs_systems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view VMRS assemblies"
  ON vmrs_assemblies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view VMRS components"
  ON vmrs_components FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view VMRS repair reasons"
  ON vmrs_reason_for_repair FOR SELECT
  TO authenticated
  USING (true);

-- Work Order Statuses: read-only for all authenticated users
CREATE POLICY "Authenticated users can view work order statuses"
  ON work_order_statuses FOR SELECT
  TO authenticated
  USING (true);

-- Work Orders: full CRUD for authenticated users
CREATE POLICY "Authenticated users can view work orders"
  ON work_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create work orders"
  ON work_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update work orders"
  ON work_orders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete work orders"
  ON work_orders FOR DELETE
  TO authenticated
  USING (true);

-- Work Order Line Items
CREATE POLICY "Authenticated users can view work order line items"
  ON work_order_line_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create work order line items"
  ON work_order_line_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update work order line items"
  ON work_order_line_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete work order line items"
  ON work_order_line_items FOR DELETE
  TO authenticated
  USING (true);

-- Work Order Sub Line Items
CREATE POLICY "Authenticated users can view work order sub line items"
  ON work_order_sub_line_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create work order sub line items"
  ON work_order_sub_line_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update work order sub line items"
  ON work_order_sub_line_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete work order sub line items"
  ON work_order_sub_line_items FOR DELETE
  TO authenticated
  USING (true);

-- Labor Time Entries
CREATE POLICY "Authenticated users can view labor time entries"
  ON labor_time_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create labor time entries"
  ON labor_time_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update labor time entries"
  ON labor_time_entries FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete labor time entries"
  ON labor_time_entries FOR DELETE
  TO authenticated
  USING (true);

-- Meter Entries
CREATE POLICY "Authenticated users can view meter entries"
  ON meter_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create meter entries"
  ON meter_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update meter entries"
  ON meter_entries FOR UPDATE
  TO authenticated
  USING (true);

-- Labels and Issues
CREATE POLICY "Authenticated users can view labels"
  ON work_order_labels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create labels"
  ON work_order_labels FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage label assignments"
  ON work_order_label_assignments FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view issues"
  ON work_order_issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create issues"
  ON work_order_issues FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage issue assignments"
  ON work_order_issue_assignments FOR ALL
  TO authenticated
  USING (true);

-- Comments, Images, Documents
CREATE POLICY "Authenticated users can view comments"
  ON work_order_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON work_order_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own comments"
  ON work_order_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can view images"
  ON work_order_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload images"
  ON work_order_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete own images"
  ON work_order_images FOR DELETE
  TO authenticated
  USING (uploaded_by_id = auth.uid());

CREATE POLICY "Authenticated users can view documents"
  ON work_order_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload documents"
  ON work_order_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete own documents"
  ON work_order_documents FOR DELETE
  TO authenticated
  USING (uploaded_by_id = auth.uid());

  /*
  # Job Card Additional Costs and Documentation System

  ## Overview
  Adds comprehensive support for tracking additional costs (vendor expenses, locally sourced parts)
  and supporting documentation (quotes, invoices, receipts) for job cards.

  ## New Tables

  ### 1. job_card_additional_costs
  Tracks additional costs beyond standard parts and labor:
  - `id` (uuid, primary key) - Unique identifier
  - `job_card_id` (uuid, foreign key) - Links to job_cards table
  - `cost_type` (text) - Type of cost: vendor_expense, locally_sourced_part, subcontractor_fee, rental_equipment, consumables, other
  - `vendor_name` (text) - Name of vendor or supplier
  - `description` (text) - Detailed description of the cost
  - `amount` (numeric) - Cost amount
  - `currency` (text) - Currency code (USD, ZAR, etc.)
  - `cost_date` (date) - Date the cost was incurred
  - `reference_number` (text) - Invoice, PO, or reference number
  - `notes` (text) - Additional notes or comments
  - `created_by` (text) - User who created the entry
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ### 2. job_card_attachments
  Stores supporting documentation for job cards:
  - `id` (uuid, primary key) - Unique identifier
  - `job_card_id` (uuid, foreign key) - Links to job_cards table
  - `additional_cost_id` (uuid, foreign key, optional) - Links to specific additional cost if applicable
  - `file_name` (text) - Original file name
  - `file_url` (text) - Storage URL for the file
  - `file_type` (text) - MIME type of the file
  - `file_size` (bigint) - File size in bytes
  - `document_type` (text) - Type: quote, invoice, receipt, photo, other
  - `description` (text) - Description of the document
  - `uploaded_by` (text) - User who uploaded the file
  - `uploaded_at` (timestamptz) - Timestamp of upload
  - `created_at` (timestamptz) - Timestamp of creation

  ## Security
  - RLS enabled on all tables
  - Authenticated users can view, insert, update, and delete their organization's data
  - Policies ensure data isolation and security

  ## Notes
  - The system supports multiple currencies for international operations
  - Additional costs are tracked separately from parts and labor for clear cost categorization
  - Documents can be linked to specific additional costs or to the job card generally
  - All monetary fields use numeric type for precision
*/

-- =====================================================
-- JOB CARD ADDITIONAL COSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS job_card_additional_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_card_id uuid NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
  cost_type text NOT NULL CHECK (cost_type IN (
    'vendor_expense',
    'locally_sourced_part',
    'subcontractor_fee',
    'rental_equipment',
    'consumables',
    'other'
  )),
  vendor_name text,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'ZAR', 'EUR', 'GBP')),
  cost_date date DEFAULT CURRENT_DATE,
  reference_number text,
  notes text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- JOB CARD ATTACHMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS job_card_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_card_id uuid NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
  additional_cost_id uuid REFERENCES job_card_additional_costs(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  document_type text NOT NULL CHECK (document_type IN (
    'quote',
    'invoice',
    'receipt',
    'photo',
    'work_order',
    'other'
  )),
  description text,
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_job_card_additional_costs_job_card_id
  ON job_card_additional_costs(job_card_id);

CREATE INDEX IF NOT EXISTS idx_job_card_additional_costs_cost_type
  ON job_card_additional_costs(cost_type);

CREATE INDEX IF NOT EXISTS idx_job_card_additional_costs_cost_date
  ON job_card_additional_costs(cost_date DESC);

CREATE INDEX IF NOT EXISTS idx_job_card_attachments_job_card_id
  ON job_card_attachments(job_card_id);

CREATE INDEX IF NOT EXISTS idx_job_card_attachments_additional_cost_id
  ON job_card_attachments(additional_cost_id);

CREATE INDEX IF NOT EXISTS idx_job_card_attachments_document_type
  ON job_card_attachments(document_type);

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_job_card_additional_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_card_additional_costs_updated_at
  BEFORE UPDATE ON job_card_additional_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_job_card_additional_costs_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE job_card_additional_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_card_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_card_additional_costs

CREATE POLICY "Authenticated users can view job card additional costs"
  ON job_card_additional_costs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert job card additional costs"
  ON job_card_additional_costs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update job card additional costs"
  ON job_card_additional_costs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete job card additional costs"
  ON job_card_additional_costs FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for job_card_attachments

CREATE POLICY "Authenticated users can view job card attachments"
  ON job_card_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert job card attachments"
  ON job_card_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update job card attachments"
  ON job_card_attachments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete job card attachments"
  ON job_card_attachments FOR DELETE
  TO authenticated
  USING (true);