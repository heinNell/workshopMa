// Type definitions for the Workshop Fleet Manager
// Using camelCase for frontend, with conversion utilities for Supabase snake_case

export interface Vehicle {
  id: string;
  fleetNumber: string;
  category: 'horses' | 'reefers' | 'interlinks' | 'ridgets' | 'bakkies';
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  registrationNumber?: string;
  status: 'active' | 'maintenance' | 'inactive';
  currentOdometer?: number;
  lastServiceDate?: Date;
  nextServiceDue?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspection {
  id: string;
  vehicleId: string;
  fleetNumber: string;
  inspectionType: 'daily' | 'weekly' | 'monthly' | 'annual';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  scheduledDate: Date;
  completedDate?: Date;
  inspectorId?: string;
  inspectorName?: string;
  odometerReading?: number;
  notes?: string;
  overallCondition?: 'good' | 'fair' | 'poor';
  faultsFound?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectionItem {
  id: string;
  inspectionId: string;
  category: string;
  itemName: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
  photoUrl?: string;
}

export interface Fault {
  id: string;
  vehicleId: string;
  fleetNumber: string;
  inspectionId?: string;
  jobCardId?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'resolved';
  category?: string;
  reportedBy?: string;
  reportedDate?: Date;
  resolvedDate?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobCard {
  id: string;
  jobNumber: string;
  vehicleId: string;
  fleetNumber: string;
  title: string;
  description: string;
  jobType?: 'repair' | 'maintenance' | 'inspection' | 'modification';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'in-progress' | 'pending-parts' | 'completed' | 'closed';
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  estimatedHours?: number;
  actualHours?: number;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobCardPart {
  id: string;
  jobCardId: string;
  inventoryItemId?: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'required' | 'ordered' | 'received' | 'installed';
}

export interface JobCardLabor {
  id: string;
  jobCardId: string;
  technicianName: string;
  description: string;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  date: Date;
}

export interface Tyre {
  id: string;
  serialNumber: string;
  vehicleId?: string;
  fleetNumber?: string;
  position?: string;
  brand: string;
  model: string;
  size: string;
  condition: 'new' | 'good' | 'fair' | 'worn' | 'replace';
  treadDepth?: number;
  currentPressure?: number;
  purchaseDate?: Date;
  purchasePrice?: number;
  installedDate?: Date;
  installedMileage?: number;
  currentMileage?: number;
  status?: 'in-use' | 'in-stock' | 'retreading' | 'disposed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TyreHistory {
  id: string;
  tyreId: string;
  action: 'install' | 'rotate' | 'remove' | 'inspect' | 'retread' | 'dispose';
  vehicleId?: string;
  fleetNumber?: string;
  position?: string;
  odometerReading?: number;
  treadDepth?: number;
  notes?: string;
  performedBy: string;
  performedDate: Date;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: string;
  quantityInStock: number;
  minimumStock: number;
  unitPrice: number;
  supplier?: string;
  location?: string;
  lastOrdered?: Date;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  transactionType: 'purchase' | 'usage' | 'adjustment' | 'return';
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  jobCardId?: string;
  vehicleId?: string;
  fleetNumber?: string;
  notes?: string;
  performedBy: string;
  transactionDate: Date;
  createdAt: Date;
}

export interface ScheduledMaintenance {
  id: string;
  vehicleId: string;
  fleetNumber: string;
  maintenanceType: string;
  description?: string;
  frequencyType?: 'mileage' | 'time' | 'both';
  frequencyMileage?: number;
  frequencyDays?: number;
  intervalKm?: number;
  intervalDays?: number;
  scheduledDate?: Date;
  lastCompletedDate?: Date;
  lastCompletedMileage?: number;
  nextDueDate?: Date;
  nextDueMileage?: number;
  status: 'scheduled' | 'upcoming' | 'due' | 'overdue' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRecord {
  id: string;
  vehicleId: string;
  fleetNumber: string;
  itemType: 'part' | 'tyre' | 'service' | 'fuel' | 'other';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  invoiceNumber?: string;
  purchaseDate: Date;
  jobCardId?: string;
  notes?: string;
  createdAt: Date;
}

// Dashboard summary types
export interface VehicleSummary {
  vehicle: Vehicle;
  activeJobCards: number;
  openFaults: number;
  upcomingInspections: number;
  lastInspectionDate?: Date;
  totalSpentThisMonth: number;
  tyreConditionSummary: Record<string, number>;
}

export interface FleetOverview {
  totalVehicles: number;
  activeVehicles: number;
  inMaintenanceVehicles: number;
  openJobCards: number;
  pendingInspections: number;
  criticalFaults: number;
  lowStockItems: number;
}

// Utility type to convert camelCase to snake_case for Supabase
export type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${SnakeCase<U>}`
  : S;

export type CamelToSnakeCase<T> = {
  [K in keyof T as SnakeCase<string & K>]: T[K];
};
