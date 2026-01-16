'use client';

import React from 'react';
import { Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface TyrePosition {
  position: string;
  label: string;
  serialNumber?: string;
  condition?: 'new' | 'good' | 'fair' | 'worn' | 'replace';
  treadDepth?: number;
}

interface TyreDiagramProps {
  vehicleType: 'horse' | 'truck' | 'trailer' | 'interlink';
  tyrePositions?: TyrePosition[];
  tyres?: Array<{ position?: string; serialNumber?: string; condition?: 'new' | 'good' | 'fair' | 'worn' | 'replace'; treadDepth?: number }>;
  onTyreClick?: (position: string | { position?: string }) => void;
  className?: string;
}

const conditionColors = {
  new: 'bg-success-500 border-success-400',
  good: 'bg-success-500/70 border-success-400',
  fair: 'bg-warning-500 border-warning-400',
  worn: 'bg-warning-500/70 border-warning-400',
  replace: 'bg-danger-500 border-danger-400',
};

const conditionLabels = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  worn: 'Worn',
  replace: 'Replace',
};

// Horse (truck tractor) tyre positions - 10 tyres
const horseTyreLayout: Array<{ position: string; label: string; x: number; y: number }> = [
  { position: 'FL', label: 'Front Left', x: 15, y: 20 },
  { position: 'FR', label: 'Front Right', x: 75, y: 20 },
  { position: 'RLO', label: 'Rear Left Outer', x: 10, y: 60 },
  { position: 'RLI', label: 'Rear Left Inner', x: 25, y: 60 },
  { position: 'RRI', label: 'Rear Right Inner', x: 65, y: 60 },
  { position: 'RRO', label: 'Rear Right Outer', x: 80, y: 60 },
  { position: 'RLO2', label: 'Rear Left Outer 2', x: 10, y: 80 },
  { position: 'RLI2', label: 'Rear Left Inner 2', x: 25, y: 80 },
  { position: 'RRI2', label: 'Rear Right Inner 2', x: 65, y: 80 },
  { position: 'RRO2', label: 'Rear Right Outer 2', x: 80, y: 80 },
];

// Single trailer tyre positions - 12 tyres (3 axles x 4 tyres)
const trailerTyreLayout: Array<{ position: string; label: string; x: number; y: number }> = [
  { position: 'A1LO', label: 'Axle 1 Left Outer', x: 10, y: 25 },
  { position: 'A1LI', label: 'Axle 1 Left Inner', x: 25, y: 25 },
  { position: 'A1RI', label: 'Axle 1 Right Inner', x: 65, y: 25 },
  { position: 'A1RO', label: 'Axle 1 Right Outer', x: 80, y: 25 },
  { position: 'A2LO', label: 'Axle 2 Left Outer', x: 10, y: 50 },
  { position: 'A2LI', label: 'Axle 2 Left Inner', x: 25, y: 50 },
  { position: 'A2RI', label: 'Axle 2 Right Inner', x: 65, y: 50 },
  { position: 'A2RO', label: 'Axle 2 Right Outer', x: 80, y: 50 },
  { position: 'A3LO', label: 'Axle 3 Left Outer', x: 10, y: 75 },
  { position: 'A3LI', label: 'Axle 3 Left Inner', x: 25, y: 75 },
  { position: 'A3RI', label: 'Axle 3 Right Inner', x: 65, y: 75 },
  { position: 'A3RO', label: 'Axle 3 Right Outer', x: 80, y: 75 },
];

// Interlink Trailer 1 (Front) - 16 tyres (4 axles x 4 tyres) + 1 spare = 17 positions
const interlinkTrailer1Layout: Array<{ position: string; label: string; x: number; y: number }> = [
  // Axle 1
  { position: 'T1-A1LO', label: 'T1 Axle 1 Left Outer', x: 8, y: 15 },
  { position: 'T1-A1LI', label: 'T1 Axle 1 Left Inner', x: 20, y: 15 },
  { position: 'T1-A1RI', label: 'T1 Axle 1 Right Inner', x: 68, y: 15 },
  { position: 'T1-A1RO', label: 'T1 Axle 1 Right Outer', x: 80, y: 15 },
  // Axle 2
  { position: 'T1-A2LO', label: 'T1 Axle 2 Left Outer', x: 8, y: 30 },
  { position: 'T1-A2LI', label: 'T1 Axle 2 Left Inner', x: 20, y: 30 },
  { position: 'T1-A2RI', label: 'T1 Axle 2 Right Inner', x: 68, y: 30 },
  { position: 'T1-A2RO', label: 'T1 Axle 2 Right Outer', x: 80, y: 30 },
  // Axle 3
  { position: 'T1-A3LO', label: 'T1 Axle 3 Left Outer', x: 8, y: 45 },
  { position: 'T1-A3LI', label: 'T1 Axle 3 Left Inner', x: 20, y: 45 },
  { position: 'T1-A3RI', label: 'T1 Axle 3 Right Inner', x: 68, y: 45 },
  { position: 'T1-A3RO', label: 'T1 Axle 3 Right Outer', x: 80, y: 45 },
  // Axle 4
  { position: 'T1-A4LO', label: 'T1 Axle 4 Left Outer', x: 8, y: 60 },
  { position: 'T1-A4LI', label: 'T1 Axle 4 Left Inner', x: 20, y: 60 },
  { position: 'T1-A4RI', label: 'T1 Axle 4 Right Inner', x: 68, y: 60 },
  { position: 'T1-A4RO', label: 'T1 Axle 4 Right Outer', x: 80, y: 60 },
  // Spare
  { position: 'T1-SP', label: 'T1 Spare', x: 44, y: 75 },
];

// Interlink Trailer 2 (Rear) - 16 tyres (4 axles x 4 tyres) + 1 spare = 17 positions
const interlinkTrailer2Layout: Array<{ position: string; label: string; x: number; y: number }> = [
  // Axle 1
  { position: 'T2-A1LO', label: 'T2 Axle 1 Left Outer', x: 8, y: 15 },
  { position: 'T2-A1LI', label: 'T2 Axle 1 Left Inner', x: 20, y: 15 },
  { position: 'T2-A1RI', label: 'T2 Axle 1 Right Inner', x: 68, y: 15 },
  { position: 'T2-A1RO', label: 'T2 Axle 1 Right Outer', x: 80, y: 15 },
  // Axle 2
  { position: 'T2-A2LO', label: 'T2 Axle 2 Left Outer', x: 8, y: 30 },
  { position: 'T2-A2LI', label: 'T2 Axle 2 Left Inner', x: 20, y: 30 },
  { position: 'T2-A2RI', label: 'T2 Axle 2 Right Inner', x: 68, y: 30 },
  { position: 'T2-A2RO', label: 'T2 Axle 2 Right Outer', x: 80, y: 30 },
  // Axle 3
  { position: 'T2-A3LO', label: 'T2 Axle 3 Left Outer', x: 8, y: 45 },
  { position: 'T2-A3LI', label: 'T2 Axle 3 Left Inner', x: 20, y: 45 },
  { position: 'T2-A3RI', label: 'T2 Axle 3 Right Inner', x: 68, y: 45 },
  { position: 'T2-A3RO', label: 'T2 Axle 3 Right Outer', x: 80, y: 45 },
  // Axle 4
  { position: 'T2-A4LO', label: 'T2 Axle 4 Left Outer', x: 8, y: 60 },
  { position: 'T2-A4LI', label: 'T2 Axle 4 Left Inner', x: 20, y: 60 },
  { position: 'T2-A4RI', label: 'T2 Axle 4 Right Inner', x: 68, y: 60 },
  { position: 'T2-A4RO', label: 'T2 Axle 4 Right Outer', x: 80, y: 60 },
  // Spare
  { position: 'T2-SP', label: 'T2 Spare', x: 44, y: 75 },
];

function TyrePositionButton({
  pos,
  tyreData,
  onTyreClick,
}: {
  pos: { position: string; label: string; x: number; y: number };
  tyreData?: TyrePosition;
  onTyreClick?: (position: string | { position?: string }) => void;
}) {
  const hasData = !!tyreData?.condition;
  const isSpare = pos.position.includes('SP');

  return (
    <button
      onClick={() => onTyreClick?.(pos.position)}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 rounded-md border-2 transition-all duration-200',
        'flex flex-col items-center justify-center gap-0.5',
        'hover:scale-110 hover:z-10',
        isSpare ? 'w-8 h-10' : 'w-8 h-12',
        hasData
          ? conditionColors[tyreData!.condition!]
          : 'bg-dark-700 border-dark-600'
      )}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      title={`${pos.label}${tyreData?.serialNumber ? ` - ${tyreData.serialNumber}` : ''}`}
    >
      <span className="text-[7px] font-bold text-white leading-tight">{pos.position.replace('T1-', '').replace('T2-', '')}</span>
      {tyreData?.treadDepth !== undefined && (
        <span className="text-[6px] text-white/80">{tyreData.treadDepth}mm</span>
      )}
    </button>
  );
}

export function TyreDiagram({
  vehicleType,
  tyrePositions,
  tyres,
  onTyreClick,
  className,
}: TyreDiagramProps) {
  // Support 'truck' as alias for 'horse'
  const effectiveType = vehicleType === 'truck' ? 'horse' : vehicleType;
  
  // Support both tyrePositions and tyres props
  const positions: TyrePosition[] = tyrePositions || (tyres?.map(t => ({
    position: t.position || '',
    label: t.position || '',
    serialNumber: t.serialNumber,
    condition: t.condition,
    treadDepth: t.treadDepth,
  })) || []);

  const getTyreData = (position: string): TyrePosition | undefined => {
    return positions.find((t) => t.position === position);
  };

  // For interlinks, render two trailer diagrams
  if (effectiveType === 'interlink') {
    return (
      <Card className={className}>
        <h3 className="text-lg font-semibold text-white mb-4">Tyre Positions - Interlink (34 Tyres)</h3>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(conditionLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className={cn(
                  'w-3 h-3 rounded-full border',
                  conditionColors[key as keyof typeof conditionColors]
                )}
              />
              <span className="text-xs text-dark-400">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-dark-600 bg-dark-700" />
            <span className="text-xs text-dark-400">Empty</span>
          </div>
        </div>

        {/* Two Trailer Diagrams */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Trailer 1 (Front) */}
          <div>
            <h4 className="text-sm font-medium text-primary-400 mb-2 text-center">Trailer 1 (Front) - 17 Positions</h4>
            <div className="relative bg-dark-800/50 rounded-xl border border-primary-500/10 aspect-[1.5/1] min-h-[250px]">
              {/* Trailer outline */}
              <div className="absolute inset-[10%] border-2 border-dashed border-primary-500/20 rounded-lg" />
              
              {/* Trailer label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="text-dark-500 text-xs font-medium">T1</span>
              </div>

              {/* Direction indicator */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-dark-500">
                Front
              </div>

              {/* Tyre positions */}
              {interlinkTrailer1Layout.map((pos) => (
                <TyrePositionButton
                  key={pos.position}
                  pos={pos}
                  tyreData={getTyreData(pos.position)}
                  onTyreClick={onTyreClick}
                />
              ))}
            </div>
          </div>

          {/* Trailer 2 (Rear) */}
          <div>
            <h4 className="text-sm font-medium text-accent-400 mb-2 text-center">Trailer 2 (Rear) - 17 Positions</h4>
            <div className="relative bg-dark-800/50 rounded-xl border border-accent-500/10 aspect-[1.5/1] min-h-[250px]">
              {/* Trailer outline */}
              <div className="absolute inset-[10%] border-2 border-dashed border-accent-500/20 rounded-lg" />
              
              {/* Trailer label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="text-dark-500 text-xs font-medium">T2</span>
              </div>

              {/* Direction indicator */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-dark-500">
                Front
              </div>

              {/* Tyre positions */}
              {interlinkTrailer2Layout.map((pos) => (
                <TyrePositionButton
                  key={pos.position}
                  pos={pos}
                  tyreData={getTyreData(pos.position)}
                  onTyreClick={onTyreClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tyre list */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium text-dark-300 mb-3">Installed Tyres ({positions.filter((t) => t.serialNumber).length} of 34)</h4>
          {positions.filter((t) => t.serialNumber).length === 0 ? (
            <p className="text-sm text-dark-500">No tyres recorded</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Trailer 1 Tyres */}
              <div>
                <h5 className="text-xs font-medium text-primary-400 mb-2">Trailer 1</h5>
                <div className="grid gap-1">
                  {positions
                    .filter((t) => t.serialNumber && t.position.startsWith('T1-'))
                    .map((tyre) => (
                      <div
                        key={tyre.position}
                        className="flex items-center justify-between p-2 bg-dark-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              tyre.condition ? conditionColors[tyre.condition].split(' ')[0] : 'bg-dark-600'
                            )}
                          />
                          <span className="text-xs font-medium text-white">{tyre.position}</span>
                          <span className="text-xs text-dark-400">{tyre.serialNumber}</span>
                        </div>
                        {tyre.treadDepth !== undefined && (
                          <span className="text-[10px] text-dark-400">{tyre.treadDepth}mm</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              {/* Trailer 2 Tyres */}
              <div>
                <h5 className="text-xs font-medium text-accent-400 mb-2">Trailer 2</h5>
                <div className="grid gap-1">
                  {positions
                    .filter((t) => t.serialNumber && t.position.startsWith('T2-'))
                    .map((tyre) => (
                      <div
                        key={tyre.position}
                        className="flex items-center justify-between p-2 bg-dark-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              tyre.condition ? conditionColors[tyre.condition].split(' ')[0] : 'bg-dark-600'
                            )}
                          />
                          <span className="text-xs font-medium text-white">{tyre.position}</span>
                          <span className="text-xs text-dark-400">{tyre.serialNumber}</span>
                        </div>
                        {tyre.treadDepth !== undefined && (
                          <span className="text-[10px] text-dark-400">{tyre.treadDepth}mm</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Standard layout for horse/trailer
  const layout = effectiveType === 'horse' ? horseTyreLayout : trailerTyreLayout;

  return (
    <Card className={className}>
      <h3 className="text-lg font-semibold text-white mb-4">Tyre Positions</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(conditionLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className={cn(
                'w-3 h-3 rounded-full border',
                conditionColors[key as keyof typeof conditionColors]
              )}
            />
            <span className="text-xs text-dark-400">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-dark-600 bg-dark-700" />
          <span className="text-xs text-dark-400">Empty</span>
        </div>
      </div>

      {/* Diagram */}
      <div className="relative bg-dark-800/50 rounded-xl border border-primary-500/10 aspect-[2/1] min-h-[300px]">
        {/* Vehicle outline */}
        <div className="absolute inset-[15%] border-2 border-dashed border-primary-500/20 rounded-lg" />

        {/* Vehicle label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="text-dark-500 text-sm font-medium">
            {vehicleType === 'horse' ? 'Truck' : 'Trailer'}
          </span>
        </div>

        {/* Direction indicator */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-dark-500">
          Front
        </div>

        {/* Tyre positions */}
        {layout.map((pos) => {
          const tyreData = getTyreData(pos.position);
          const hasData = !!tyreData?.condition;

          return (
            <button
              key={pos.position}
              onClick={() => onTyreClick?.(pos.position)}
              className={cn(
                'absolute w-10 h-14 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 transition-all duration-200',
                'flex flex-col items-center justify-center gap-0.5',
                'hover:scale-110 hover:z-10',
                hasData
                  ? conditionColors[tyreData!.condition!]
                  : 'bg-dark-700 border-dark-600'
              )}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={`${pos.label}${tyreData?.serialNumber ? ` - ${tyreData.serialNumber}` : ''}`}
            >
              <span className="text-[8px] font-bold text-white">{pos.position}</span>
              {tyreData?.treadDepth !== undefined && (
                <span className="text-[7px] text-white/80">{tyreData.treadDepth}mm</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tyre list */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-dark-300 mb-3">Installed Tyres</h4>
        {positions.filter((t) => t.serialNumber).length === 0 ? (
          <p className="text-sm text-dark-500">No tyres recorded</p>
        ) : (
          <div className="grid gap-2">
            {positions
              .filter((t) => t.serialNumber)
              .map((tyre) => (
                <div
                  key={tyre.position}
                  className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        tyre.condition ? conditionColors[tyre.condition].split(' ')[0] : 'bg-dark-600'
                      )}
                    />
                    <div>
                      <span className="text-sm font-medium text-white">{tyre.position}</span>
                      <span className="text-dark-500 mx-2">-</span>
                      <span className="text-sm text-dark-300">{tyre.serialNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tyre.treadDepth !== undefined && (
                      <span className="text-xs text-dark-400">{tyre.treadDepth}mm</span>
                    )}
                    {tyre.condition && (
                      <Badge
                        variant={
                          tyre.condition === 'new' || tyre.condition === 'good'
                            ? 'success'
                            : tyre.condition === 'fair' || tyre.condition === 'worn'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {conditionLabels[tyre.condition]}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Card>
  );
}
