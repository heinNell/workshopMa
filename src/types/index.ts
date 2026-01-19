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
  // New fields from inspection forms system
  inspectionFormId?: string;
  inspectionFormVersionId?: string;
  userId?: string;
  startedAt?: Date;
  submittedAt?: Date;
  date?: Date;
  failedItems?: number;
  startingLatitude?: number;
  startingLongitude?: number;
  submittedLatitude?: number;
  submittedLongitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectionForm {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectionFormVersion {
  id: string;
  inspectionFormId: string;
  versionNumber: number;
  formStructure: {
    categories: Array<{
      name: string;
      items: string[];
    }>;
  };
  createdAt: Date;
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
  priority: 'low' | 'medium' | 'high' | 'urgent';
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

// Work Order types aligned with SQL schema (jobcardscreation.sql)
export interface WorkOrder {
  id: string;
  number: string;
  description?: string;
  state: 'draft' | 'open' | 'in-progress' | 'pending-parts' | 'completed' | 'closed' | 'cancelled';
  // Dates
  issuedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  expectedCompletedAt?: Date;
  scheduledAt?: Date;
  durationInSeconds?: number;
  laborTimeInSeconds?: number;
  // Associations
  createdById?: string;
  createdByName?: string;
  issuedById?: string;
  issuedByName?: string;
  contactId?: string;
  contactName?: string;
  contactImageUrl?: string;
  vehicleId: string;
  vehicleName?: string;
  vendorId?: string;
  vendorName?: string;
  workOrderStatusId?: string;
  workOrderStatusName?: string;
  workOrderStatusColor?: string;
  // Financial
  invoiceNumber?: string;
  purchaseOrderNumber?: string;
  discountType?: string;
  discountPercentage?: number;
  discount?: number;
  partsSubtotal?: number;
  laborSubtotal?: number;
  subtotal?: number;
  tax1Type?: string;
  tax1Percentage?: number;
  tax1?: number;
  tax2Type?: string;
  tax2Percentage?: number;
  tax2?: number;
  partsMarkupType?: string;
  partsMarkup?: number;
  partsMarkupPercentage?: number;
  laborMarkupType?: string;
  laborMarkup?: number;
  laborMarkupPercentage?: number;
  totalAmount?: number;
  // Meter readings
  startingMeterValue?: number;
  endingMeterValue?: number;
  startingSecondaryMeterValue?: number;
  endingSecondaryMeterValue?: number;
  endingMeterSameAsStart?: boolean;
  // Flags
  isWatched?: boolean;
  customFields?: Record<string, unknown>;
  attachmentPermissions?: {
    read_photos: boolean;
    manage_photos: boolean;
    read_documents: boolean;
    manage_documents: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrderLineItem {
  id: string;
  workOrderId: string;
  title?: string;
  description?: string;
  // VMRS codes
  vmrsSystemGroupId?: string;
  vmrsSystemId?: string;
  vmrsAssemblyId?: string;
  vmrsComponentId?: string;
  vmrsReasonForRepairId?: string;
  vmrsRepairPriorityClassId?: string;
  // Totals
  partsTotal?: number;
  laborTotal?: number;
  total?: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrderSubLineItem {
  id: string;
  workOrderLineItemId: string;
  itemType: 'Contact' | 'Part' | 'Labor';
  description?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  // Part-specific
  partId?: string;
  partNumber?: string;
  partName?: string;
  // Contact/Labor specific
  contactId?: string;
  contactName?: string;
  laborHours?: number;
  laborRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaborTimeEntry {
  id: string;
  workOrderId: string;
  workOrderLineItemId?: string;
  workOrderSubLineItemId?: string;
  contactId?: string;
  contactName?: string;
  startedAt?: Date;
  endedAt?: Date;
  durationInSeconds?: number;
  active: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  employeeNumber?: string;
  jobTitle?: string;
  department?: string;
  licenseClass?: string;
  licenseNumber?: string;
  licenseExpiryDate?: Date;
  birthDate?: Date;
  startDate?: Date;
  isTechnician: boolean;
  isVehicleOperator: boolean;
  isEmployee: boolean;
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

export interface TyreAllocation {
  id: string;
  tyreCode: string;
  brand: string;
  pattern: string;
  supplier: string;
  cost: number;
  currentKilometers: number;
  mountedDate: Date;
  vehicleId?: string;
  fleetNumber?: string;
  position: string;
  size?: string;
  condition?: 'new' | 'good' | 'fair' | 'worn' | 'replace';
  treadDepth?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TyreAllocationFormData {
  tyreCode: string;
  brand: string;
  pattern: string;
  supplier: string;
  cost: number;
  currentKilometers: number;
  mountedDate: string;
  position: string;
  size?: string;
  condition?: 'new' | 'good' | 'fair' | 'worn' | 'replace';
  treadDepth?: number;
  notes?: string;
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
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
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
