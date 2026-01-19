/*
  # Create Inspection Forms System

  1. New Tables
    - `inspection_forms`
      - `id` (uuid, primary key)
      - `title` (text) - Form template title
      - `description` (text) - Form description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `inspection_form_versions`
      - `id` (uuid, primary key)
      - `inspection_form_id` (uuid, foreign key)
      - `version_number` (integer)
      - `form_structure` (jsonb) - Stores the form fields/categories
      - `created_at` (timestamptz)

  2. Changes to existing tables
    - Add fields to `inspections` table:
      - `inspection_form_id` (uuid, foreign key)
      - `inspection_form_version_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to users)
      - `started_at` (timestamptz)
      - `submitted_at` (timestamptz)
      - `date` (date)
      - `failed_items` (integer) - Count of failed inspection items
      - `starting_latitude` (numeric)
      - `starting_longitude` (numeric)
      - `submitted_latitude` (numeric)
      - `submitted_longitude` (numeric)

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to read their data
*/

-- Create inspection_forms table
CREATE TABLE IF NOT EXISTS inspection_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inspection_form_versions table
CREATE TABLE IF NOT EXISTS inspection_form_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_form_id uuid REFERENCES inspection_forms(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  form_structure jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(inspection_form_id, version_number)
);

-- Add new columns to inspections table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'inspection_form_id'
  ) THEN
    ALTER TABLE inspections ADD COLUMN inspection_form_id uuid REFERENCES inspection_forms(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'inspection_form_version_id'
  ) THEN
    ALTER TABLE inspections ADD COLUMN inspection_form_version_id uuid REFERENCES inspection_form_versions(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE inspections ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE inspections ADD COLUMN started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE inspections ADD COLUMN submitted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'date'
  ) THEN
    ALTER TABLE inspections ADD COLUMN date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'failed_items'
  ) THEN
    ALTER TABLE inspections ADD COLUMN failed_items integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'starting_latitude'
  ) THEN
    ALTER TABLE inspections ADD COLUMN starting_latitude numeric(10, 7);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'starting_longitude'
  ) THEN
    ALTER TABLE inspections ADD COLUMN starting_longitude numeric(10, 7);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'submitted_latitude'
  ) THEN
    ALTER TABLE inspections ADD COLUMN submitted_latitude numeric(10, 7);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'submitted_longitude'
  ) THEN
    ALTER TABLE inspections ADD COLUMN submitted_longitude numeric(10, 7);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE inspection_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_form_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for inspection_forms
CREATE POLICY "Users can view all inspection forms"
  ON inspection_forms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create inspection forms"
  ON inspection_forms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update inspection forms"
  ON inspection_forms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for inspection_form_versions
CREATE POLICY "Users can view all inspection form versions"
  ON inspection_form_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create inspection form versions"
  ON inspection_form_versions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update inspections table policies if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inspections' AND policyname = 'Users can view all inspections'
  ) THEN
    CREATE POLICY "Users can view all inspections"
      ON inspections FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Insert default inspection form for existing inspections
INSERT INTO inspection_forms (id, title, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Standard Vehicle Inspection',
  'Comprehensive vehicle inspection covering all major systems'
)
ON CONFLICT (id) DO NOTHING;

-- Insert default form version
INSERT INTO inspection_form_versions (id, inspection_form_id, version_number, form_structure)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  1,
  '{
    "categories": [
      {"name": "Exterior", "items": ["Body Condition", "Paint Condition", "Windows & Glass", "Lights & Indicators", "Mirrors"]},
      {"name": "Tyres", "items": ["Front Left Tyre", "Front Right Tyre", "Rear Left Tyre", "Rear Right Tyre", "Spare Tyre"]},
      {"name": "Under Hood", "items": ["Engine Oil Level", "Coolant Level", "Brake Fluid Level", "Battery Condition", "Belt Condition", "Hoses & Connections"]},
      {"name": "Brakes", "items": ["Brake Pads Front", "Brake Pads Rear", "Brake Discs", "Brake Performance"]},
      {"name": "Suspension", "items": ["Shock Absorbers", "Springs", "Ball Joints", "Steering Components"]},
      {"name": "Interior", "items": ["Dashboard Warning Lights", "Seat Belts", "Horn", "Wipers", "Air Conditioning"]}
    ]
  }'::jsonb
)
ON CONFLICT (inspection_form_id, version_number) DO NOTHING;

-- Update existing inspections to link to default form
UPDATE inspections
SET
  inspection_form_id = '00000000-0000-0000-0000-000000000001',
  inspection_form_version_id = '00000000-0000-0000-0000-000000000001',
  date = created_at::date,
  submitted_at = created_at
WHERE inspection_form_id IS NULL;