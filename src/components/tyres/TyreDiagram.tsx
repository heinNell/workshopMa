'use client';

import { cn } from '@/lib/utils';

interface TyrePosition {
  position: string;
  label: string;
  serialNumber?: string;
  condition?: 'new' | 'good' | 'fair' | 'worn' | 'replace';
  treadDepth?: number;
}

interface TyreDiagramProps {
  vehicleType: 'horse' | 'truck' | 'trailer' | 'interlink' | 'ridget' | 'ridget30H' | 'bakkie';
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

// Ridge Truck (Ridget) tyre positions - 6 tyres (2 steering + 4 drive)
const ridgetTyreLayout: Array<{ position: string; label: string; x: number; y: number }> = [
  // Front steering axle - single tyres
  { position: 'FL', label: 'Front Left Steering', x: 15, y: 20 },
  { position: 'FR', label: 'Front Right Steering', x: 75, y: 20 },
  // Rear drive axle - dual tyres (inner/outer on each side)
  { position: 'RLO', label: 'Rear Left Outer', x: 10, y: 70 },
  { position: 'RLI', label: 'Rear Left Inner', x: 25, y: 70 },
  { position: 'RRI', label: 'Rear Right Inner', x: 65, y: 70 },
  { position: 'RRO', label: 'Rear Right Outer', x: 80, y: 70 },
];

// Ridge Truck 30H tyre positions - 10 tyres (2 steering + 8 drive on 2 axles)
const ridget30HTyreLayout: Array<{ position: string; label: string; x: number; y: number }> = [
  // Front steering axle - single tyres
  { position: 'FL', label: 'Front Left Steering', x: 15, y: 20 },
  { position: 'FR', label: 'Front Right Steering', x: 75, y: 20 },
  // First rear drive axle - dual tyres
  { position: 'RLO', label: 'Rear Left Outer', x: 10, y: 55 },
  { position: 'RLI', label: 'Rear Left Inner', x: 25, y: 55 },
  { position: 'RRI', label: 'Rear Right Inner', x: 65, y: 55 },
  { position: 'RRO', label: 'Rear Right Outer', x: 80, y: 55 },
  // Second rear drive axle - dual tyres
  { position: 'RLO2', label: 'Rear Left Outer 2', x: 10, y: 80 },
  { position: 'RLI2', label: 'Rear Left Inner 2', x: 25, y: 80 },
  { position: 'RRI2', label: 'Rear Right Inner 2', x: 65, y: 80 },
  { position: 'RRO2', label: 'Rear Right Outer 2', x: 80, y: 80 },
];

// LMV Bakkie tyre positions - 4 tyres (2 steering + 2 drive)
const bakkieTyreLayout: Array<{ position: string; label: string; x: number; y: number }> = [
  // Front steering axle - single tyres
  { position: 'FL', label: 'Front Left Steering', x: 15, y: 25 },
  { position: 'FR', label: 'Front Right Steering', x: 75, y: 25 },
  // Rear drive axle - single tyres
  { position: 'RL', label: 'Rear Left Drive', x: 15, y: 70 },
  { position: 'RR', label: 'Rear Right Drive', x: 75, y: 70 },
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

  // Get last 4-6 characters of serial number for display
  const shortSerial = tyreData?.serialNumber 
    ? tyreData.serialNumber.slice(-6) 
    : null;

  return (
    <button
      onClick={() => onTyreClick?.(pos.position)}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 rounded-md border-2 transition-all duration-200',
        'flex flex-col items-center justify-center gap-0.5',
        'hover:scale-110 hover:z-10',
        isSpare ? 'w-10 h-12' : 'w-10 h-14',
        hasData
          ? conditionColors[tyreData!.condition!]
          : 'bg-dark-700 border-dark-600'
      )}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      title={`${pos.label}${tyreData?.serialNumber ? ` - ${tyreData.serialNumber}` : ''}`}
    >
      <span className="text-[7px] font-bold text-white leading-tight">{pos.position.replace('T1-', '').replace('T2-', '')}</span>
      {hasData && shortSerial && (
        <span className="text-[5px] text-white/90 font-medium truncate max-w-full px-0.5">{shortSerial}</span>
      )}
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
      <div className={cn('space-y-4', className)}>
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 p-3 bg-dark-800/30 rounded-lg">
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Trailer 1 (Front) */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-primary-400 text-center">Trailer 1 (Front) - 17 Positions</h4>
            <div className="relative bg-dark-800/50 rounded-xl border border-primary-500/20 aspect-[1.4/1] min-h-[280px]">
              {/* Trailer outline */}
              <div className="absolute inset-[10%] border-2 border-dashed border-primary-500/20 rounded-lg" />
              
              {/* Trailer label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="text-dark-600 text-lg font-bold">T1</span>
              </div>

              {/* Direction indicator */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-dark-500 font-medium">
                ↑ Front
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
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-accent-400 text-center">Trailer 2 (Rear) - 17 Positions</h4>
            <div className="relative bg-dark-800/50 rounded-xl border border-accent-500/20 aspect-[1.4/1] min-h-[280px]">
              {/* Trailer outline */}
              <div className="absolute inset-[10%] border-2 border-dashed border-accent-500/20 rounded-lg" />
              
              {/* Trailer label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="text-dark-600 text-lg font-bold">T2</span>
              </div>

              {/* Direction indicator */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-dark-500 font-medium">
                ↑ Front
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
      </div>
    );
  }

  // Select layout based on vehicle type
  const getLayout = () => {
    switch (effectiveType) {
      case 'horse':
        return horseTyreLayout;
      case 'ridget':
        return ridgetTyreLayout;
      case 'ridget30H':
        return ridget30HTyreLayout;
      case 'bakkie':
        return bakkieTyreLayout;
      case 'trailer':
      default:
        return trailerTyreLayout;
    }
  };

  const getVehicleLabel = () => {
    switch (effectiveType) {
      case 'horse':
        return 'Truck (Horse)';
      case 'ridget':
        return 'Ridge Truck';
      case 'ridget30H':
        return 'Ridge Truck 30H';
      case 'bakkie':
        return 'LMV Bakkie';
      case 'trailer':
      default:
        return 'Trailer';
    }
  };

  const layout = getLayout();
  const totalPositions = layout.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-3 bg-dark-800/30 rounded-lg">
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
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-primary-400 text-center">
          {getVehicleLabel()} - {totalPositions} Positions
        </h4>
        <div className="relative bg-dark-800/50 rounded-xl border border-primary-500/20 aspect-[2/1] min-h-[300px]">
          {/* Vehicle outline */}
          <div className="absolute inset-[12%] border-2 border-dashed border-primary-500/20 rounded-lg" />

          {/* Vehicle label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="text-dark-600 text-lg font-bold">
              {effectiveType === 'horse' ? 'TRUCK' : effectiveType === 'ridget' || effectiveType === 'ridget30H' ? 'RIDGET' : effectiveType === 'bakkie' ? 'BAKKIE' : 'TRAILER'}
            </span>
          </div>

          {/* Direction indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-dark-500 font-medium">
            ↑ Front
          </div>

          {/* Tyre positions */}
          {layout.map((pos) => {
            const tyreData = getTyreData(pos.position);
            const hasData = !!tyreData?.condition;
            // Get last 6 characters of serial number for display
            const shortSerial = tyreData?.serialNumber 
              ? tyreData.serialNumber.slice(-6) 
              : null;

            return (
              <button
                key={pos.position}
                onClick={() => onTyreClick?.(pos.position)}
                className={cn(
                  'absolute w-12 h-16 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 transition-all duration-200',
                  'flex flex-col items-center justify-center gap-0.5',
                  'hover:scale-110 hover:z-10 hover:shadow-lg',
                  hasData
                    ? conditionColors[tyreData!.condition!]
                    : 'bg-dark-700 border-dark-600 hover:border-primary-500'
                )}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                title={`${pos.label}${tyreData?.serialNumber ? ` - ${tyreData.serialNumber}` : ''}`}
              >
                <span className="text-[8px] font-bold text-white">{pos.position}</span>
                {hasData && shortSerial && (
                  <span className="text-[6px] text-white/90 font-medium truncate max-w-full px-0.5">{shortSerial}</span>
                )}
                {tyreData?.treadDepth !== undefined && (
                  <span className="text-[7px] text-white/80">{tyreData.treadDepth}mm</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
