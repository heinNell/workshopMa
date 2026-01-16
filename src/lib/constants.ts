// Fleet Configuration
export type FleetCategory = 'horses' | 'reefers' | 'interlinks' | 'ridgets' | 'bakkies';

export interface FleetItem {
  id: string;
  fleetNumber: string;
  category: FleetCategory;
  displayName: string;
}

export interface FleetCategoryConfig {
  id: FleetCategory;
  label: string;
  description: string;
  icon: string;
  fleetNumbers: string[];
}

export const FLEET_CATEGORIES: FleetCategoryConfig[] = [
  {
    id: 'horses',
    label: 'Horses',
    description: 'Truck tractors / Prime movers',
    icon: 'Truck',
    fleetNumbers: ['21H', '22H', '23H', '24H', '26H', '28H', '31H', '32H', '33H', '34H'],
  },
  {
    id: 'reefers',
    label: 'Reefers',
    description: 'Refrigerated trailers',
    icon: 'Thermometer',
    fleetNumbers: ['4F', '5F', '6F', '7F', '8F', '9F'],
  },
  {
    id: 'interlinks',
    label: 'Interlinks',
    description: 'Interlink trailers',
    icon: 'Container',
    fleetNumbers: ['1T', '2T', '3T', '4T'],
  },
  {
    id: 'ridgets',
    label: 'Ridgets',
    description: 'Rigid body trucks',
    icon: 'TruckIcon',
    fleetNumbers: ['1H', '4H', '6H', '29H', '30H'],
  },
  {
    id: 'bakkies',
    label: 'Bakkies',
    description: 'Light delivery vehicles',
    icon: 'Car',
    fleetNumbers: ['14L', '15L', '16L', '17L'],
  },
];

export const ALL_FLEET_NUMBERS = FLEET_CATEGORIES.flatMap((cat) =>
  cat.fleetNumbers.map((num) => ({
    id: num.toLowerCase().replace(/\s/g, '-'),
    fleetNumber: num,
    category: cat.id,
    displayName: `${cat.label.slice(0, -1)} ${num}`,
  }))
);

export function getFleetByNumber(fleetNumber: string): FleetItem | undefined {
  return ALL_FLEET_NUMBERS.find(
    (f) => f.fleetNumber.toLowerCase() === fleetNumber.toLowerCase()
  );
}

export function getFleetsByCategory(category: FleetCategory): FleetItem[] {
  return ALL_FLEET_NUMBERS.filter((f) => f.category === category);
}

export function getCategoryConfig(category: FleetCategory): FleetCategoryConfig | undefined {
  return FLEET_CATEGORIES.find((c) => c.id === category);
}

// Status types used across the application
export type InspectionStatus = 'scheduled' | 'in-progress' | 'completed' | 'overdue';
export type JobCardStatus = 'open' | 'in-progress' | 'pending-parts' | 'completed' | 'closed';
export type FaultSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TyreCondition = 'new' | 'good' | 'fair' | 'worn' | 'replace';

// Navigation configuration
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { id: 'inspections', label: 'Inspections', href: '/inspections', icon: 'ClipboardCheck' },
  { id: 'job-cards', label: 'Job Cards', href: '/job-cards', icon: 'FileText' },
  { id: 'tyres', label: 'Tyre Management', href: '/tyres', icon: 'Circle' },
  { id: 'inventory', label: 'Inventory', href: '/inventory', icon: 'Package' },
  { id: 'reports', label: 'Reports', href: '/reports', icon: 'BarChart3' },
];
