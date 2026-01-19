'use client';

import { Badge, Button, Card, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Fault, Inspection, JobCard } from '@/types';
import { AlertTriangle, Edit2, FileText, Plus, Trash2 } from 'lucide-react';

interface FaultListProps {
  faults: Fault[];
  inspections?: Inspection[];
  jobCards?: JobCard[];
  onFaultEdit?: (fault: Fault) => void;
  onFaultDelete?: (fault: Fault) => void;
  onCreateJobCard?: (fault: Fault) => void;
  showActions?: boolean;
  loading?: boolean;
}

export function FaultList({
  faults,
  inspections = [],
  jobCards = [],
  onFaultEdit,
  onFaultDelete,
  onCreateJobCard,
  showActions = false,
  loading = false,
}: FaultListProps) {
  const getSeverityStyles = (severity: Fault['severity']) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
      case 'high':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
      case 'medium':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
      case 'low':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
      default:
        return { bg: 'bg-dark-700', text: 'text-dark-400', border: 'border-dark-600' };
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (faults.length === 0) {
    return (
      <Card>
        <div className="text-center py-16">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-dark-600" />
          <h3 className="text-lg font-medium text-white mb-2">No Faults Recorded</h3>
          <p className="text-dark-400">This vehicle has no reported faults</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {faults.map((fault) => {
        const linkedInspection = inspections.find(i => i.id === fault.inspectionId);
        const linkedJobCard = jobCards.find(jc => jc.id === fault.jobCardId);
        const styles = getSeverityStyles(fault.severity);

        return (
          <div
            key={fault.id}
            className={`p-4 rounded-xl bg-dark-800/50 border ${styles.border} hover:bg-dark-800/70 transition-colors`}
          >
            <div className="flex items-start gap-4">
              {/* Severity Icon */}
              <div className={`p-2.5 rounded-lg ${styles.bg} flex-shrink-0`}>
                <AlertTriangle className={`w-5 h-5 ${styles.text}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium leading-tight">{fault.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        variant={fault.severity === 'critical' ? 'error' : fault.severity === 'high' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {fault.severity.charAt(0).toUpperCase() + fault.severity.slice(1)}
                      </Badge>
                      {fault.category && (
                        <Badge variant="default" size="sm">
                          {fault.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={fault.status} />
                    {showActions && (
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFaultEdit?.(fault)}
                          title="Edit fault"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFaultDelete?.(fault)}
                          className="text-danger-400 hover:text-danger-300"
                          title="Delete fault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Linked Inspection */}
                {linkedInspection && (
                  <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-dark-700/50 border border-dark-600">
                    <FileText className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-dark-300">
                      From {linkedInspection.inspectionType} inspection on {formatDate(linkedInspection.scheduledDate)}
                      {linkedInspection.inspectorName && ` by ${linkedInspection.inspectorName}`}
                    </span>
                  </div>
                )}

                {/* Linked Job Card */}
                {linkedJobCard ? (
                  <div className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-accent-500/10 border border-accent-500/20">
                    <FileText className="w-4 h-4 text-accent-400" />
                    <span className="text-sm text-accent-300">
                      Job Card: {linkedJobCard.jobNumber} - {linkedJobCard.title}
                    </span>
                    <StatusBadge status={linkedJobCard.status} />
                  </div>
                ) : fault.status === 'open' && onCreateJobCard && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-accent-400 hover:text-accent-300"
                    onClick={() => onCreateJobCard(fault)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Create Job Card
                  </Button>
                )}

                {/* Resolution Notes */}
                {fault.resolutionNotes && fault.status === 'resolved' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-success-500/10 border border-success-500/20">
                    <p className="text-sm text-success-300">
                      <span className="font-medium">Resolution:</span> {fault.resolutionNotes}
                    </p>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 mt-3 text-sm text-dark-400">
                  <span>Reported: {formatDate(fault.createdAt)}</span>
                  {fault.reportedBy && <span>By: {fault.reportedBy}</span>}
                  {fault.resolvedDate && (
                    <span className="text-success-400">Resolved: {formatDate(fault.resolvedDate)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
