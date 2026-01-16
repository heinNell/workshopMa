import {
    BarChart3,
    Car,
    Circle,
    ClipboardCheck,
    Container,
    FileText,
    LayoutDashboard,
    Package,
    Thermometer,
    Truck,
} from 'lucide-react';
import React from 'react';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Circle,
  Package,
  BarChart3,
  Truck,
  Thermometer,
  Container,
  TruckIcon: Truck,
  Car,
};

export const NavIcon = React.memo(({ name, className }: { name: string; className?: string }) => {
  const Icon = iconMap[name] || Circle;
  return <Icon className={className} />;
});
NavIcon.displayName = 'NavIcon';
