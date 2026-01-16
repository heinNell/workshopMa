'use client';

import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { CheckCircle, ChevronDown, ChevronRight, Minus, XCircle } from 'lucide-react';
import { useState } from 'react';

interface InspectionCategory {
  id: string;
  name: string;
  items: InspectionItem[];
}

interface InspectionItem {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  notes?: string;
  photoUrl?: string;
}

interface InspectionFormProps {
  fleetNumber: string;
  inspectionType: 'daily' | 'weekly' | 'monthly' | 'annual';
  categories: InspectionCategory[];
  onSubmit: (data: { categories: InspectionCategory[]; notes: string; odometer: number }) => void;
  onCancel: () => void;
  loading?: boolean;
}

const defaultCategories: InspectionCategory[] = [
  {
    id: 'exterior',
    name: 'Exterior Condition',
    items: [
      { id: 'body-damage', name: 'Body damage / dents', status: 'pending' },
      { id: 'lights-front', name: 'Front lights (headlights, indicators)', status: 'pending' },
      { id: 'lights-rear', name: 'Rear lights (tail lights, brake lights)', status: 'pending' },
      { id: 'mirrors', name: 'Side mirrors condition', status: 'pending' },
      { id: 'windscreen', name: 'Windscreen condition', status: 'pending' },
      { id: 'wipers', name: 'Wiper blades', status: 'pending' },
    ],
  },
  {
    id: 'tyres',
    name: 'Tyres & Wheels',
    items: [
      { id: 'tyre-condition', name: 'Tyre condition and tread depth', status: 'pending' },
      { id: 'tyre-pressure', name: 'Tyre pressure', status: 'pending' },
      { id: 'wheel-nuts', name: 'Wheel nuts secure', status: 'pending' },
      { id: 'spare-tyre', name: 'Spare tyre condition', status: 'pending' },
    ],
  },
  {
    id: 'engine',
    name: 'Engine & Fluids',
    items: [
      { id: 'oil-level', name: 'Engine oil level', status: 'pending' },
      { id: 'coolant', name: 'Coolant level', status: 'pending' },
      { id: 'brake-fluid', name: 'Brake fluid level', status: 'pending' },
      { id: 'power-steering', name: 'Power steering fluid', status: 'pending' },
      { id: 'belts', name: 'Drive belts condition', status: 'pending' },
      { id: 'leaks', name: 'No visible leaks', status: 'pending' },
    ],
  },
  {
    id: 'brakes',
    name: 'Brakes & Safety',
    items: [
      { id: 'brake-pads', name: 'Brake pads condition', status: 'pending' },
      { id: 'handbrake', name: 'Handbrake operation', status: 'pending' },
      { id: 'abs-warning', name: 'ABS warning light', status: 'pending' },
      { id: 'fire-extinguisher', name: 'Fire extinguisher present', status: 'pending' },
      { id: 'first-aid', name: 'First aid kit', status: 'pending' },
      { id: 'reflective-triangles', name: 'Reflective triangles', status: 'pending' },
    ],
  },
  {
    id: 'cabin',
    name: 'Cabin & Interior',
    items: [
      { id: 'seatbelts', name: 'Seatbelts functional', status: 'pending' },
      { id: 'horn', name: 'Horn working', status: 'pending' },
      { id: 'dashboard', name: 'Dashboard warning lights', status: 'pending' },
      { id: 'ac', name: 'Air conditioning', status: 'pending' },
      { id: 'cleanliness', name: 'Cabin cleanliness', status: 'pending' },
    ],
  },
];

export function InspectionForm({
  fleetNumber,
  inspectionType,
  categories = defaultCategories,
  onSubmit,
  onCancel,
  loading = false,
}: InspectionFormProps) {
  const [formCategories, setFormCategories] = useState(categories);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [notes, setNotes] = useState('');
  const [odometer, setOdometer] = useState('');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const updateItemStatus = (
    categoryId: string,
    itemId: string,
    status: 'pass' | 'fail' | 'na'
  ) => {
    setFormCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, status } : item
              ),
            }
          : cat
      )
    );
  };

  const updateItemNotes = (categoryId: string, itemId: string, noteText: string) => {
    setFormCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, notes: noteText } : item
              ),
            }
          : cat
      )
    );
  };

  const getCategoryStats = (category: InspectionCategory) => {
    const total = category.items.length;
    const completed = category.items.filter((i) => i.status !== 'pending').length;
    const failed = category.items.filter((i) => i.status === 'fail').length;
    return { total, completed, failed };
  };

  const getTotalStats = () => {
    const allItems = formCategories.flatMap((c) => c.items);
    const total = allItems.length;
    const completed = allItems.filter((i) => i.status !== 'pending').length;
    const passed = allItems.filter((i) => i.status === 'pass').length;
    const failed = allItems.filter((i) => i.status === 'fail').length;
    return { total, completed, passed, failed };
  };

  const handleSubmit = () => {
    onSubmit({
      categories: formCategories,
      notes,
      odometer: parseInt(odometer) || 0,
    });
  };

  const totalStats = getTotalStats();
  const canSubmit = totalStats.completed === totalStats.total && odometer !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {inspectionType.charAt(0).toUpperCase() + inspectionType.slice(1)} Inspection
            </h2>
            <p className="text-dark-400 mt-1">
              {fleetNumber} - {formatDate(new Date())}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {totalStats.completed}/{totalStats.total}
            </p>
            <p className="text-sm text-dark-400">Items checked</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
            style={{ width: `${(totalStats.completed / totalStats.total) * 100}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <Badge variant="success">{totalStats.passed} Passed</Badge>
          {totalStats.failed > 0 && (
            <Badge variant="danger">{totalStats.failed} Failed</Badge>
          )}
        </div>
      </Card>

      {/* Odometer */}
      <Card>
        <Input
          label="Current Odometer Reading (km)"
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          placeholder="Enter current odometer reading"
        />
      </Card>

      {/* Inspection Categories */}
      {formCategories.map((category) => {
        const stats = getCategoryStats(category);
        const isExpanded = expandedCategories.includes(category.id);

        return (
          <Card key={category.id} className="overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-dark-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-dark-400" />
                )}
                <h3 className="font-semibold text-white">{category.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-400">
                  {stats.completed}/{stats.total}
                </span>
                {stats.failed > 0 && <Badge variant="danger">{stats.failed}</Badge>}
                {stats.completed === stats.total && stats.failed === 0 && (
                  <CheckCircle className="w-5 h-5 text-success-500" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-3">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 rounded-lg border transition-colors',
                      item.status === 'pass' && 'border-success-500/20 bg-success-500/5',
                      item.status === 'fail' && 'border-danger-500/20 bg-danger-500/5',
                      item.status === 'na' && 'border-dark-700 bg-dark-800/50',
                      item.status === 'pending' && 'border-primary-500/10'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateItemStatus(category.id, item.id, 'pass')
                          }
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            item.status === 'pass'
                              ? 'bg-success-500 text-white'
                              : 'bg-dark-800 text-dark-400 hover:bg-success-500/20 hover:text-success-500'
                          )}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateItemStatus(category.id, item.id, 'fail')
                          }
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            item.status === 'fail'
                              ? 'bg-danger-500 text-white'
                              : 'bg-dark-800 text-dark-400 hover:bg-danger-500/20 hover:text-danger-500'
                          )}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateItemStatus(category.id, item.id, 'na')
                          }
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            item.status === 'na'
                              ? 'bg-dark-600 text-white'
                              : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                          )}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {item.status === 'fail' && (
                      <div className="mt-3">
                        <Textarea
                          placeholder="Describe the issue..."
                          value={item.notes || ''}
                          onChange={(e) =>
                            updateItemNotes(category.id, item.id, e.target.value)
                          }
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* Additional Notes */}
      <Card>
        <Textarea
          label="Additional Notes"
          placeholder="Enter any additional observations or comments..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit} loading={loading}>
          Complete Inspection
        </Button>
      </div>
    </div>
  );
}
