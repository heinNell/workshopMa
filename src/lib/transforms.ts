// Transform database row types (snake_case) to frontend types (camelCase)

import type { FaultRow } from '@/hooks/useFaults';
import type { InspectionRow } from '@/hooks/useInspections';
import type { InventoryItemRow } from '@/hooks/useInventory';
import type { JobCardRow } from '@/hooks/useJobCards';
import type { ScheduledMaintenanceRow } from '@/hooks/useScheduledMaintenance';
import type { TyreHistoryRow, TyreRow } from '@/hooks/useTyres';
import type { VehicleRow } from '@/hooks/useVehicles';
import type { Fault, Inspection, InventoryItem, JobCard, ScheduledMaintenance, Tyre, TyreHistory, Vehicle } from '@/types';

export function transformVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    fleetNumber: row.fleet_number,
    category: row.category as Vehicle['category'],
    make: row.make || undefined,
    model: row.model || undefined,
    year: row.year || undefined,
    vin: row.vin || undefined,
    registrationNumber: row.registration_number || undefined,
    status: row.status,
    currentOdometer: row.current_odometer || undefined,
    lastServiceDate: row.last_service_date ? new Date(row.last_service_date) : undefined,
    nextServiceDue: row.next_service_due ? new Date(row.next_service_due) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function transformInspection(row: InspectionRow): Inspection {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    fleetNumber: row.fleet_number,
    inspectionType: row.inspection_type,
    status: row.status,
    scheduledDate: new Date(row.scheduled_date),
    completedDate: row.completed_date ? new Date(row.completed_date) : undefined,
    inspectorName: row.inspector_name || undefined,
    odometerReading: row.odometer_reading || undefined,
    notes: row.notes || undefined,
    faultsFound: row.faults_found,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function transformJobCard(row: JobCardRow): JobCard {
  return {
    id: row.id,
    jobNumber: row.job_number,
    vehicleId: row.vehicle_id,
    fleetNumber: row.fleet_number,
    title: row.title,
    description: row.description,
    jobType: row.job_type,
    priority: row.priority,
    status: row.status,
    assignedTechnicianName: row.assigned_to || undefined,
    estimatedHours: row.estimated_hours || undefined,
    actualHours: row.actual_hours || undefined,
    laborCost: row.labor_cost || undefined,
    partsCost: row.parts_cost || undefined,
    totalCost: row.total_cost || undefined,
    startDate: row.start_date ? new Date(row.start_date) : undefined,
    dueDate: row.due_date ? new Date(row.due_date) : undefined,
    completedDate: row.completed_date ? new Date(row.completed_date) : undefined,
    notes: row.notes || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function transformFault(row: FaultRow): Fault {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    fleetNumber: row.fleet_number,
    inspectionId: row.inspection_id || undefined,
    jobCardId: row.job_card_id || undefined,
    description: row.description,
    severity: row.severity,
    status: row.status,
    reportedBy: row.reported_by,
    reportedDate: new Date(row.reported_date),
    resolvedDate: row.resolved_date ? new Date(row.resolved_date) : undefined,
    resolutionNotes: row.resolution_notes || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function transformTyre(row: TyreRow): Tyre {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    vehicleId: row.vehicle_id || undefined,
    fleetNumber: row.fleet_number || undefined,
    position: row.position || undefined,
    brand: row.brand,
    model: row.model,
    size: row.size,
    condition: row.condition,
    treadDepth: row.tread_depth || undefined,
    purchaseDate: row.purchase_date ? new Date(row.purchase_date) : undefined,
    purchasePrice: row.purchase_price || undefined,
    installedMileage: row.mileage_at_install || undefined,
    currentMileage: row.current_mileage || undefined,
    status: row.status,
    notes: row.notes || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function transformTyreHistory(row: TyreHistoryRow): TyreHistory {
  return {
    id: row.id,
    tyreId: row.tyre_id,
    action: row.action,
    vehicleId: row.vehicle_id || undefined,
    fleetNumber: row.fleet_number || undefined,
    position: row.position || undefined,
    odometerReading: row.odometer_reading || undefined,
    treadDepth: row.tread_depth || undefined,
    notes: row.notes || undefined,
    performedBy: row.performed_by,
    performedDate: new Date(row.performed_date),
    createdAt: new Date(row.created_at),
  };
}

export function transformInventoryItem(row: InventoryItemRow): InventoryItem {
  return {
    id: row.id,
    partNumber: row.part_number,
    name: row.name,
    description: row.description || undefined,
    category: row.category,
    quantityInStock: row.quantity_in_stock,
    minimumStock: row.minimum_stock,
    unitPrice: row.unit_price,
    supplier: row.supplier || undefined,
    location: row.location || undefined,
    lastOrdered: row.last_ordered ? new Date(row.last_ordered) : undefined,
    lastUsed: row.last_used ? new Date(row.last_used) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function transformScheduledMaintenance(row: ScheduledMaintenanceRow): ScheduledMaintenance {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    fleetNumber: row.fleet_number,
    maintenanceType: row.maintenance_type,
    description: row.description || undefined,
    intervalDays: row.interval_days || undefined,
    intervalKm: row.interval_km || undefined,
    lastCompletedDate: row.last_completed_date ? new Date(row.last_completed_date) : undefined,
    lastCompletedMileage: row.last_completed_mileage || undefined,
    scheduledDate: row.next_due_date ? new Date(row.next_due_date) : new Date(),
    nextDueMileage: row.next_due_mileage || undefined,
    status: row.status as ScheduledMaintenance['status'],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
