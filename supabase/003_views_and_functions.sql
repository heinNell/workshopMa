-- Workshop Fleet Manager - Views and Functions
-- Migration: 003_views_and_functions
-- Date: 2026-01-16
-- Description: Helper views and functions for the fleet management system

-- =====================================================
-- VIEWS
-- =====================================================

-- Vehicle summary view with key metrics
CREATE OR REPLACE VIEW vehicle_summary AS
SELECT 
    v.id,
    v.fleet_number,
    v.category,
    v.make,
    v.model,
    v.year,
    v.status,
    v.current_odometer,
    v.last_service_date,
    v.next_service_due,
    COALESCE(jc.active_job_cards, 0) as active_job_cards,
    COALESCE(f.open_faults, 0) as open_faults,
    COALESCE(i.pending_inspections, 0) as pending_inspections,
    COALESCE(pr.monthly_spend, 0) as monthly_spend
FROM vehicles v
LEFT JOIN (
    SELECT vehicle_id, COUNT(*) as active_job_cards 
    FROM job_cards 
    WHERE status NOT IN ('completed', 'closed')
    GROUP BY vehicle_id
) jc ON v.id = jc.vehicle_id
LEFT JOIN (
    SELECT vehicle_id, COUNT(*) as open_faults 
    FROM faults 
    WHERE status != 'resolved'
    GROUP BY vehicle_id
) f ON v.id = f.vehicle_id
LEFT JOIN (
    SELECT vehicle_id, COUNT(*) as pending_inspections 
    FROM inspections 
    WHERE status IN ('scheduled', 'overdue')
    GROUP BY vehicle_id
) i ON v.id = i.vehicle_id
LEFT JOIN (
    SELECT vehicle_id, SUM(total_price) as monthly_spend 
    FROM purchase_records 
    WHERE purchase_date >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY vehicle_id
) pr ON v.id = pr.vehicle_id;

-- Fleet overview by category
CREATE OR REPLACE VIEW fleet_category_summary AS
SELECT 
    category,
    COUNT(*) as total_vehicles,
    COUNT(*) FILTER (WHERE status = 'active') as active_vehicles,
    COUNT(*) FILTER (WHERE status = 'maintenance') as in_maintenance,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_vehicles
FROM vehicles
GROUP BY category;

-- Job cards overview
CREATE OR REPLACE VIEW job_cards_overview AS
SELECT 
    jc.*,
    v.make,
    v.model,
    COALESCE(parts.parts_count, 0) as parts_count,
    COALESCE(labor.labor_hours, 0) as total_labor_hours
FROM job_cards jc
JOIN vehicles v ON jc.vehicle_id = v.id
LEFT JOIN (
    SELECT job_card_id, COUNT(*) as parts_count
    FROM job_card_parts
    GROUP BY job_card_id
) parts ON jc.id = parts.job_card_id
LEFT JOIN (
    SELECT job_card_id, SUM(hours) as labor_hours
    FROM job_card_labor
    GROUP BY job_card_id
) labor ON jc.id = labor.job_card_id;

-- Tyre overview with vehicle info
CREATE OR REPLACE VIEW tyres_overview AS
SELECT 
    t.*,
    v.make as vehicle_make,
    v.model as vehicle_model,
    v.category as vehicle_category
FROM tyres t
LEFT JOIN vehicles v ON t.vehicle_id = v.id;

-- Overdue maintenance items
CREATE OR REPLACE VIEW overdue_maintenance AS
SELECT 
    sm.*,
    v.make,
    v.model,
    v.current_odometer,
    CASE 
        WHEN sm.next_due_date < CURRENT_DATE THEN 'date_overdue'
        WHEN sm.next_due_mileage IS NOT NULL AND v.current_odometer >= sm.next_due_mileage THEN 'mileage_overdue'
        ELSE 'due_soon'
    END as overdue_reason
FROM scheduled_maintenance sm
JOIN vehicles v ON sm.vehicle_id = v.id
WHERE sm.status IN ('due', 'overdue')
   OR sm.next_due_date <= CURRENT_DATE + INTERVAL '7 days'
   OR (sm.next_due_mileage IS NOT NULL AND v.current_odometer >= sm.next_due_mileage - 500);

-- Low stock inventory items
CREATE OR REPLACE VIEW low_stock_items AS
SELECT *
FROM inventory_items
WHERE quantity_in_stock <= minimum_stock
ORDER BY 
    CASE WHEN quantity_in_stock = 0 THEN 0 ELSE 1 END,
    (quantity_in_stock::float / NULLIF(minimum_stock, 0)) ASC;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate job card number
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM job_cards
    WHERE job_number LIKE year_prefix || '-%';
    
    new_number := year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Calculate job card total cost
CREATE OR REPLACE FUNCTION calculate_job_card_cost(p_job_card_id UUID)
RETURNS TABLE(labor_cost DECIMAL, parts_cost DECIMAL, total_cost DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(jcl.total_cost), 0)::DECIMAL as labor_cost,
        COALESCE(SUM(jcp.total_price), 0)::DECIMAL as parts_cost,
        (COALESCE(SUM(jcl.total_cost), 0) + COALESCE(SUM(jcp.total_price), 0))::DECIMAL as total_cost
    FROM job_cards jc
    LEFT JOIN job_card_labor jcl ON jc.id = jcl.job_card_id
    LEFT JOIN job_card_parts jcp ON jc.id = jcp.job_card_id
    WHERE jc.id = p_job_card_id;
END;
$$ LANGUAGE plpgsql;

-- Update inspection status based on date
CREATE OR REPLACE FUNCTION update_inspection_statuses()
RETURNS void AS $$
BEGIN
    UPDATE inspections
    SET status = 'overdue', updated_at = NOW()
    WHERE status = 'scheduled'
      AND scheduled_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Update scheduled maintenance statuses
CREATE OR REPLACE FUNCTION update_maintenance_statuses()
RETURNS void AS $$
BEGIN
    -- Mark as due if within 7 days or 500km
    UPDATE scheduled_maintenance sm
    SET status = 'due', updated_at = NOW()
    FROM vehicles v
    WHERE sm.vehicle_id = v.id
      AND sm.status = 'upcoming'
      AND (
          sm.next_due_date <= CURRENT_DATE + INTERVAL '7 days'
          OR (sm.next_due_mileage IS NOT NULL AND v.current_odometer >= sm.next_due_mileage - 500)
      );
    
    -- Mark as overdue if past due date or mileage
    UPDATE scheduled_maintenance sm
    SET status = 'overdue', updated_at = NOW()
    FROM vehicles v
    WHERE sm.vehicle_id = v.id
      AND sm.status IN ('upcoming', 'due')
      AND (
          sm.next_due_date < CURRENT_DATE
          OR (sm.next_due_mileage IS NOT NULL AND v.current_odometer >= sm.next_due_mileage)
      );
END;
$$ LANGUAGE plpgsql;

-- Get vehicle statistics for dashboard
CREATE OR REPLACE FUNCTION get_vehicle_stats(p_vehicle_id UUID)
RETURNS TABLE(
    active_job_cards BIGINT,
    open_faults BIGINT,
    upcoming_inspections BIGINT,
    completed_inspections_30d BIGINT,
    total_spent_this_month DECIMAL,
    tyres_good BIGINT,
    tyres_fair BIGINT,
    tyres_worn BIGINT,
    tyres_replace BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM job_cards WHERE vehicle_id = p_vehicle_id AND status NOT IN ('completed', 'closed'))::BIGINT,
        (SELECT COUNT(*) FROM faults WHERE vehicle_id = p_vehicle_id AND status != 'resolved')::BIGINT,
        (SELECT COUNT(*) FROM inspections WHERE vehicle_id = p_vehicle_id AND status IN ('scheduled', 'overdue'))::BIGINT,
        (SELECT COUNT(*) FROM inspections WHERE vehicle_id = p_vehicle_id AND status = 'completed' AND completed_date >= CURRENT_DATE - INTERVAL '30 days')::BIGINT,
        (SELECT COALESCE(SUM(total_price), 0) FROM purchase_records WHERE vehicle_id = p_vehicle_id AND purchase_date >= DATE_TRUNC('month', CURRENT_DATE))::DECIMAL,
        (SELECT COUNT(*) FROM tyres WHERE vehicle_id = p_vehicle_id AND condition IN ('new', 'good'))::BIGINT,
        (SELECT COUNT(*) FROM tyres WHERE vehicle_id = p_vehicle_id AND condition = 'fair')::BIGINT,
        (SELECT COUNT(*) FROM tyres WHERE vehicle_id = p_vehicle_id AND condition = 'worn')::BIGINT,
        (SELECT COUNT(*) FROM tyres WHERE vehicle_id = p_vehicle_id AND condition = 'replace')::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Get fleet overview statistics
CREATE OR REPLACE FUNCTION get_fleet_overview()
RETURNS TABLE(
    total_vehicles BIGINT,
    active_vehicles BIGINT,
    in_maintenance BIGINT,
    open_job_cards BIGINT,
    pending_inspections BIGINT,
    critical_faults BIGINT,
    low_stock_items BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM vehicles)::BIGINT,
        (SELECT COUNT(*) FROM vehicles WHERE status = 'active')::BIGINT,
        (SELECT COUNT(*) FROM vehicles WHERE status = 'maintenance')::BIGINT,
        (SELECT COUNT(*) FROM job_cards WHERE status NOT IN ('completed', 'closed'))::BIGINT,
        (SELECT COUNT(*) FROM inspections WHERE status IN ('scheduled', 'overdue'))::BIGINT,
        (SELECT COUNT(*) FROM faults WHERE severity = 'critical' AND status != 'resolved')::BIGINT,
        (SELECT COUNT(*) FROM inventory_items WHERE quantity_in_stock <= minimum_stock)::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEDULED JOBS (using pg_cron if available)
-- Note: These require pg_cron extension to be enabled
-- =====================================================

-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('update-inspection-status', '0 6 * * *', 'SELECT update_inspection_statuses()');
-- SELECT cron.schedule('update-maintenance-status', '0 6 * * *', 'SELECT update_maintenance_statuses()');
