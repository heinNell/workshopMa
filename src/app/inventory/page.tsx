'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { InventoryList } from '@/components/inventory';
import type { InventoryItem } from '@/types';

// Mock data
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    partNumber: 'FLT-OIL-001',
    name: 'Oil Filter - Scania R Series',
    category: 'Filters',
    quantityInStock: 15,
    minimumStock: 5,
    unitPrice: 450,
    location: 'Shelf A1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    partNumber: 'FLT-AIR-001',
    name: 'Air Filter - Scania R Series',
    category: 'Filters',
    quantityInStock: 3,
    minimumStock: 3,
    unitPrice: 890,
    location: 'Shelf A2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    partNumber: 'BRK-PAD-001',
    name: 'Brake Pads - Front Axle HD',
    category: 'Brakes',
    quantityInStock: 8,
    minimumStock: 4,
    unitPrice: 2800,
    location: 'Shelf B1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    partNumber: 'FLD-OIL-001',
    name: 'Engine Oil 15W-40 - 20L',
    category: 'Fluids',
    quantityInStock: 0,
    minimumStock: 10,
    unitPrice: 1850,
    location: 'Bay D1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    partNumber: 'LGT-TAIL-001',
    name: 'Tail Light LED - Trailer',
    category: 'Lights',
    quantityInStock: 10,
    minimumStock: 4,
    unitPrice: 450,
    location: 'Shelf C1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    partNumber: 'ELC-BAT-001',
    name: 'Battery 12V 200Ah HD',
    category: 'Electrical',
    quantityInStock: 4,
    minimumStock: 2,
    unitPrice: 3800,
    location: 'Bay F1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    partNumber: 'BLT-FAN-001',
    name: 'Fan Belt - Scania',
    category: 'Belts',
    quantityInStock: 2,
    minimumStock: 3,
    unitPrice: 380,
    location: 'Shelf E1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    partNumber: 'SUS-AIR-001',
    name: 'Air Bag - Rear Suspension',
    category: 'Suspension',
    quantityInStock: 6,
    minimumStock: 2,
    unitPrice: 3200,
    location: 'Bay G1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function InventoryPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-dark-400 mt-1">Track parts, supplies, and stock levels</p>
        </div>

        {/* Inventory List Component handles everything */}
        <InventoryList 
          items={mockInventoryItems}
          onItemClick={(item) => console.log('Clicked:', item)}
          onAddItem={() => console.log('Add item clicked')}
        />
      </div>
    </MainLayout>
  );
}
