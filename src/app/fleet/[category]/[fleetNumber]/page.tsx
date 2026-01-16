'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, Button, Badge, StatusBadge, Tabs, TabPanel } from '@/components/ui';
import { StatCard } from '@/components/dashboard';
import { InspectionList } from '@/components/inspections';
import { JobCardList } from '@/components/job-cards';
import { TyreDiagram, TyreList, TyreHistoryList } from '@/components/tyres';
import { getCategoryConfig, type FleetCategory } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import {
  transformInspection,
  transformJobCard,
  transformFault,
  transformTyre,
  transformTyreHistory,
  transformScheduledMaintenance,
} from '@/lib/transforms';
import { useVehicleByFleetNumber } from '@/hooks/useVehicles';
import { useInspectionsByFleetNumber } from '@/hooks/useInspections';
import { useJobCardsByFleetNumber } from '@/hooks/useJobCards';
import { useFaultsByFleetNumber } from '@/hooks/useFaults';
import { useTyresByFleetNumber, useTyreHistoryByFleetNumber } from '@/hooks/useTyres';
import { useScheduledMaintenanceByFleetNumber } from '@/hooks/useScheduledMaintenance';
import {
  ArrowLeft,
  Truck,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  Circle,
  Calendar,
  Clock,
  FileText,
  Plus,
  History,
  Settings,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export default function VehicleDashboardPage() {
  const params = useParams();
  const category = params.category as FleetCategory;
  const fleetNumber = (params.fleetNumber as string).toUpperCase();

  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data from Supabase
  const { data: vehicleRow, loading: vehicleLoading, error: vehicleError } = useVehicleByFleetNumber(fleetNumber);
  const { data: inspectionRows, loading: inspectionsLoading } = useInspectionsByFleetNumber(fleetNumber);
  const { data: jobCardRows, loading: jobCardsLoading } = useJobCardsByFleetNumber(fleetNumber);
  const { data: faultRows, loading: faultsLoading } = useFaultsByFleetNumber(fleetNumber);
  const { data: tyreRows, loading: tyresLoading } = useTyresByFleetNumber(fleetNumber);
  const { data: tyreHistoryRows, loading: tyreHistoryLoading } = useTyreHistoryByFleetNumber(fleetNumber);
  const { data: maintenanceRows, loading: maintenanceLoading } = useScheduledMaintenanceByFleetNumber(fleetNumber);

  const categoryConfig = getCategoryConfig(category);

  // Transform data from database rows to frontend types
  const inspections = useMemo(() => inspectionRows.map(transformInspection), [inspectionRows]);
  const jobCards = useMemo(() => jobCardRows.map(transformJobCard), [jobCardRows]);
  const faults = useMemo(() => faultRows.map(transformFault), [faultRows]);
  const tyres = useMemo(() => tyreRows.map(transformTyre), [tyreRows]);
  const tyreHistory = useMemo(() => tyreHistoryRows.map(transformTyreHistory), [tyreHistoryRows]);
  const scheduledMaintenance = useMemo(() => maintenanceRows.map(transformScheduledMaintenance), [maintenanceRows]);

  // Calculate stats
  const vehicleStats = useMemo(() => ({
    status: vehicleRow?.status || 'active',
    totalInspections: inspections.length,
    completedInspections: inspections.filter(i => i.status === 'completed').length,
    openJobCards: jobCards.filter(jc => jc.status !== 'completed' && jc.status !== 'closed').length,
    activeFaults: faults.filter(f => f.status !== 'resolved').length,
    lastInspection: inspections.find(i => i.status === 'completed')?.completedDate,
    nextMaintenance: scheduledMaintenance.find(m => m.status !== 'completed')?.scheduledDate,
    mileage: vehicleRow?.current_odometer || 0,
  }), [vehicleRow, inspections, jobCards, faults, scheduledMaintenance]);

  // Loading state
  if (vehicleLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-dark-400">Loading vehicle data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (vehicleError || !vehicleRow) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Vehicle Not Found</h1>
            <p className="text-dark-400">The requested vehicle does not exist in the database.</p>
            <Link href={`/fleet/${category}`} className="mt-4 inline-block text-primary-400 hover:text-primary-300">
              Return to {categoryConfig?.label || 'Fleet'}
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
    { id: 'job-cards', label: 'Job Cards', icon: FileText },
    { id: 'faults', label: 'Faults', icon: AlertTriangle },
    { id: 'tyres', label: 'Tyres', icon: Circle },
    { id: 'maintenance', label: 'Maintenance', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Navigation & Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/fleet/${category}`}
              className="p-2 rounded-lg bg-dark-800/50 border border-primary-500/10 hover:border-primary-500/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-dark-400" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20">
                <Truck className="w-8 h-8 text-primary-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">{fleetNumber}</h1>
                  <StatusBadge status={vehicleStats.status} />
                </div>
                <p className="text-dark-400">
                  {vehicleRow.make} {vehicleRow.model} {vehicleRow.year && `(${vehicleRow.year})`} - {categoryConfig?.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
              Configure
            </Button>
            <Button variant="secondary">
              <ClipboardCheck className="w-4 h-4" />
              New Inspection
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Create Job Card
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Inspections"
            value={vehicleStats.totalInspections}
            icon={ClipboardCheck}
            trend={vehicleStats.completedInspections > 0 ? { value: vehicleStats.completedInspections, isPositive: true } : undefined}
          />
          <StatCard
            title="Open Job Cards"
            value={vehicleStats.openJobCards}
            icon={Wrench}
          />
          <StatCard
            title="Active Faults"
            value={vehicleStats.activeFaults}
            icon={AlertTriangle}
            className={vehicleStats.activeFaults > 0 ? 'border-warning-500/20' : ''}
          />
          <StatCard
            title="Mileage (km)"
            value={vehicleStats.mileage.toLocaleString()}
            icon={TrendingUp}
          />
          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Clock className="w-4 h-4" />
              Last Inspection
            </div>
            <p className="text-white font-semibold mt-1">
              {vehicleStats.lastInspection ? formatDate(vehicleStats.lastInspection) : 'N/A'}
            </p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Calendar className="w-4 h-4" />
              Next Maintenance
            </div>
            <p className="text-white font-semibold mt-1">
              {vehicleStats.nextMaintenance ? formatDate(vehicleStats.nextMaintenance) : 'N/A'}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <TabPanel activeTab={activeTab} tabId="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Tyre Status */}
            <Card>
              <CardHeader>
                <CardTitle>Tyre Status</CardTitle>
              </CardHeader>
              <div className="flex justify-center py-4">
                {tyresLoading ? (
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                ) : tyres.length > 0 ? (
                  <TyreDiagram
                    tyres={tyres}
                    vehicleType={category === 'horses' ? 'truck' : category === 'interlinks' ? 'interlink' : 'trailer'}
                    onTyreClick={(tyre) => console.log('Tyre clicked:', tyre)}
                  />
                ) : (
                  <p className="text-dark-400">No tyres recorded</p>
                )}
              </div>
            </Card>

            {/* Recent Faults */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Faults</CardTitle>
                  <Badge variant="warning">{faults.filter(f => f.status !== 'resolved').length}</Badge>
                </div>
              </CardHeader>
              {faultsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : faults.filter(f => f.status !== 'resolved').length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  No active faults
                </div>
              ) : (
                <div className="space-y-3">
                  {faults.filter(f => f.status !== 'resolved').slice(0, 3).map((fault) => (
                    <div
                      key={fault.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/30 border border-primary-500/10"
                    >
                      <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{fault.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={fault.severity === 'critical' ? 'error' : fault.severity === 'high' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {fault.severity}
                          </Badge>
                          <span className="text-xs text-dark-500">
                            {formatDate(fault.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Inspections */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Inspections</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('inspections')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              {inspectionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : inspections.length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  No inspections recorded
                </div>
              ) : (
                <div className="space-y-3">
                  {inspections.slice(0, 3).map((inspection) => (
                    <div
                      key={inspection.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 border border-primary-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-white text-sm capitalize">{inspection.inspectionType} Inspection</p>
                          <p className="text-xs text-dark-400">{formatDate(inspection.scheduledDate)}</p>
                        </div>
                      </div>
                      <StatusBadge status={inspection.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Active Job Cards */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Job Cards</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('job-cards')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              {jobCardsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : jobCards.filter(jc => jc.status !== 'completed' && jc.status !== 'closed').length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  No active job cards
                </div>
              ) : (
                <div className="space-y-3">
                  {jobCards.filter(jc => jc.status !== 'completed' && jc.status !== 'closed').slice(0, 3).map((jobCard) => (
                    <div
                      key={jobCard.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 border border-primary-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-white text-sm">{jobCard.title}</p>
                          <p className="text-xs text-dark-400">{jobCard.jobNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={jobCard.priority === 'urgent' ? 'error' : jobCard.priority === 'high' ? 'warning' : 'default'}
                          size="sm"
                        >
                          {jobCard.priority}
                        </Badge>
                        <StatusBadge status={jobCard.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="inspections">
          {inspectionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
          ) : inspections.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-dark-400">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No inspections recorded for this vehicle</p>
                <Button variant="secondary" className="mt-4">
                  <Plus className="w-4 h-4" />
                  Schedule Inspection
                </Button>
              </div>
            </Card>
          ) : (
            <InspectionList
              inspections={inspections}
              onInspectionClick={(inspection) => console.log('View inspection:', inspection)}
            />
          )}
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="job-cards">
          {jobCardsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
          ) : jobCards.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-dark-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No job cards recorded for this vehicle</p>
                <Button variant="secondary" className="mt-4">
                  <Plus className="w-4 h-4" />
                  Create Job Card
                </Button>
              </div>
            </Card>
          ) : (
            <JobCardList
              jobCards={jobCards}
              onJobCardClick={(jobCard) => console.log('View job card:', jobCard)}
            />
          )}
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="faults">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fault History</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{faults.filter(f => f.status === 'open').length} Open</Badge>
                  <Badge variant="info">{faults.filter(f => f.status === 'in-progress').length} In Progress</Badge>
                  <Badge variant="success">{faults.filter(f => f.status === 'resolved').length} Resolved</Badge>
                  <Button variant="secondary" size="sm">
                    <Plus className="w-4 h-4" />
                    Report Fault
                  </Button>
                </div>
              </div>
            </CardHeader>
            {faultsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              </div>
            ) : faults.length === 0 ? (
              <div className="text-center py-12 text-dark-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No faults recorded for this vehicle</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faults.map((fault) => {
                  const linkedInspection = inspections.find(i => i.id === fault.inspectionId);
                  const linkedJobCard = jobCards.find(jc => jc.id === fault.jobCardId);
                  
                  return (
                    <div
                      key={fault.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-dark-800/30 border border-primary-500/10"
                    >
                      <div className={`p-2 rounded-lg ${
                        fault.severity === 'critical' ? 'bg-red-500/20' :
                        fault.severity === 'high' ? 'bg-orange-500/20' :
                        fault.severity === 'medium' ? 'bg-yellow-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 ${
                          fault.severity === 'critical' ? 'text-red-400' :
                          fault.severity === 'high' ? 'text-orange-400' :
                          fault.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{fault.description}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <Badge
                                variant={fault.severity === 'critical' ? 'error' : fault.severity === 'high' ? 'warning' : 'default'}
                                size="sm"
                              >
                                {fault.severity}
                              </Badge>
                            </div>
                          </div>
                          <StatusBadge status={fault.status} />
                        </div>
                        
                        {/* Linked Inspection */}
                        {linkedInspection && (
                          <div className="flex items-center gap-2 mt-3 p-2 rounded bg-dark-700/50">
                            <ClipboardCheck className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-dark-300">
                              From {linkedInspection.inspectionType} inspection on {formatDate(linkedInspection.scheduledDate)}
                              {linkedInspection.inspectorName && ` by ${linkedInspection.inspectorName}`}
                            </span>
                          </div>
                        )}
                        
                        {/* Linked Job Card */}
                        {linkedJobCard ? (
                          <div className="flex items-center gap-2 mt-2 p-2 rounded bg-accent-500/10 border border-accent-500/20">
                            <FileText className="w-4 h-4 text-accent-400" />
                            <span className="text-sm text-accent-300">
                              Job Card: {linkedJobCard.jobNumber} - {linkedJobCard.title}
                            </span>
                            <StatusBadge status={linkedJobCard.status} />
                          </div>
                        ) : fault.status === 'open' && (
                          <div className="mt-2">
                            <Button variant="ghost" size="sm" className="text-accent-400">
                              <Plus className="w-3 h-3 mr-1" />
                              Create Job Card
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-dark-400">
                          <span>Reported: {formatDate(fault.createdAt)}</span>
                          {fault.resolvedDate && (
                            <span className="text-success-400">Resolved: {formatDate(fault.resolvedDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="tyres">
          <div className="space-y-6">
            <div className={category === 'interlinks' ? 'grid lg:grid-cols-1 gap-6' : 'grid lg:grid-cols-3 gap-6'}>
              <div className={category === 'interlinks' ? '' : 'lg:col-span-1'}>
                <Card>
                  <CardHeader>
                    <CardTitle>Tyre Positions</CardTitle>
                  </CardHeader>
                  <div className="flex justify-center py-4">
                    {tyresLoading ? (
                      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                    ) : (
                      <TyreDiagram
                        tyres={tyres}
                        vehicleType={category === 'horses' ? 'truck' : category === 'interlinks' ? 'interlink' : 'trailer'}
                        onTyreClick={(tyre) => console.log('Tyre clicked:', tyre)}
                      />
                    )}
                  </div>
                </Card>
              </div>
              {category !== 'interlinks' && (
                <div className="lg:col-span-2">
                  {tyresLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                    </div>
                  ) : tyres.length === 0 ? (
                    <Card>
                      <div className="text-center py-12 text-dark-400">
                        <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tyres recorded for this vehicle</p>
                      </div>
                    </Card>
                  ) : (
                    <TyreList
                      tyres={tyres}
                      onTyreClick={(tyre) => console.log('View tyre:', tyre)}
                    />
                  )}
                </div>
              )}
            </div>

            {category === 'interlinks' && tyres.length > 0 && (
              <TyreList
                tyres={tyres}
                onTyreClick={(tyre) => console.log('View tyre:', tyre)}
              />
            )}

            {/* Tyre History Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tyre History</CardTitle>
                  <Badge variant="default">{tyreHistory.length} records</Badge>
                </div>
              </CardHeader>
              {tyreHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : (
                <TyreHistoryList history={tyreHistory} />
              )}
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="maintenance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scheduled Maintenance</CardTitle>
                <Button variant="secondary" size="sm">
                  <Plus className="w-4 h-4" />
                  Schedule Maintenance
                </Button>
              </div>
            </CardHeader>
            {maintenanceLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              </div>
            ) : scheduledMaintenance.length === 0 ? (
              <div className="text-center py-12 text-dark-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled maintenance for this vehicle</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledMaintenance.map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-dark-800/30 border border-primary-500/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary-500/20">
                        <Calendar className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{maintenance.maintenanceType}</p>
                        <p className="text-sm text-dark-400">
                          Due: {formatDate(maintenance.scheduledDate)}
                          {maintenance.intervalKm && ` or every ${maintenance.intervalKm.toLocaleString()} km`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={maintenance.status} />
                      <Button variant="ghost" size="sm">Complete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="history">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle History</CardTitle>
            </CardHeader>
            <div className="py-12 text-center text-dark-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Complete vehicle history timeline will be displayed here</p>
              <p className="text-sm mt-2">Including all inspections, job cards, maintenance, and purchases</p>
            </div>
          </Card>
        </TabPanel>
      </div>
    </MainLayout>
  );
}
