'use client';

import { MainLayout } from '@/components/layout';
import { Button, Card, StatusBadge } from '@/components/ui';
import { useVehicles } from '@/hooks/useVehicles';
import { getCategoryConfig, type FleetCategory } from '@/lib/constants';
import { ChevronRight, ClipboardCheck, Loader2, Plus, Truck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function FleetCategoryPage() {
  const params = useParams();
  const category = params.category as FleetCategory;
  
  const categoryConfig = getCategoryConfig(category);
  
  // Map category to database vehicle_type
  const vehicleTypeMap: Record<FleetCategory, string> = {
    horses: 'truck',
    reefers: 'refrigerated',
    interlinks: 'interlink',
    ridgets: 'trailer',
    bakkies: 'bakkie',
  };
  
  const { data: vehicles, loading } = useVehicles(vehicleTypeMap[category]);

  if (!categoryConfig) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Category Not Found</h1>
            <p className="text-dark-400">The requested fleet category does not exist.</p>
            <Link href="/" className="mt-4 inline-block text-primary-400 hover:text-primary-300">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-dark-400">Loading {categoryConfig.label}...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate stats from real data
  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    inactive: vehicles.filter(v => v.status === 'inactive').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{categoryConfig.label}</h1>
            <p className="text-dark-400 mt-1">{categoryConfig.description}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <ClipboardCheck className="w-4 h-4" />
              Bulk Inspection
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-dark-400">Total Vehicles</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </Card>
          <Card>
            <p className="text-sm text-dark-400">Active</p>
            <p className="text-2xl font-bold text-success-500 mt-1">{stats.active}</p>
          </Card>
          <Card className="border-warning-500/20">
            <p className="text-sm text-dark-400">In Maintenance</p>
            <p className="text-2xl font-bold text-warning-500 mt-1">{stats.maintenance}</p>
          </Card>
          <Card>
            <p className="text-sm text-dark-400">Inactive</p>
            <p className="text-2xl font-bold text-dark-400 mt-1">{stats.inactive}</p>
          </Card>
        </div>

        {/* Fleet Grid */}
        {vehicles.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-dark-400">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No vehicles found in this category</p>
              <Button variant="secondary" className="mt-4">
                <Plus className="w-4 h-4" />
                Add Vehicle
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/fleet/${category}/${vehicle.fleet_number.toLowerCase()}`}
              >
                <Card className="hover:border-primary-500/30 transition-all cursor-pointer group h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 group-hover:border-primary-500/40 transition-colors">
                        <Truck className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{vehicle.fleet_number}</h3>
                        <p className="text-sm text-dark-400">
                          {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-dark-300 transition-colors" />
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-primary-500/10">
                    <StatusBadge status={vehicle.status} />
                    {vehicle.vin && (
                      <span className="text-xs text-dark-500 truncate max-w-[150px]">
                        VIN: {vehicle.vin}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
