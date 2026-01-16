'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Button, Badge, Input, Select, DataTable } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Package, Plus, Search, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import type { InventoryItem } from '@/types';

interface InventoryListProps {
  items: InventoryItem[];
  onItemClick?: (item: InventoryItem) => void;
  onAddItem?: () => void;
  className?: string;
}

export function InventoryList({
  items,
  onItemClick,
  onAddItem,
  className,
}: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.quantityInStock <= item.minimumStock) ||
      (stockFilter === 'out' && item.quantityInStock === 0) ||
      (stockFilter === 'in-stock' && item.quantityInStock > item.minimumStock);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = items.filter(
    (i) => i.quantityInStock <= i.minimumStock && i.quantityInStock > 0
  ).length;
  const outOfStockCount = items.filter((i) => i.quantityInStock === 0).length;
  const totalValue = items.reduce(
    (sum, i) => sum + i.quantityInStock * i.unitPrice,
    0
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Total Items</p>
              <p className="text-2xl font-bold text-white mt-1">{items.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-500/10">
              <Package className="w-5 h-5 text-primary-400" />
            </div>
          </div>
        </Card>

        <Card className={lowStockCount > 0 ? 'border-warning-500/20' : ''}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Low Stock</p>
              <p className="text-2xl font-bold text-white mt-1">{lowStockCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning-500/10">
              <TrendingDown className="w-5 h-5 text-warning-500" />
            </div>
          </div>
        </Card>

        <Card className={outOfStockCount > 0 ? 'border-danger-500/20' : ''}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Out of Stock</p>
              <p className="text-2xl font-bold text-white mt-1">{outOfStockCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-danger-500/10">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Total Value</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent-500/10">
              <TrendingUp className="w-5 h-5 text-accent-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <Input
              placeholder="Search by name or part number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48"
          />
          <Select
            options={[
              { value: 'all', label: 'All Stock Levels' },
              { value: 'in-stock', label: 'In Stock' },
              { value: 'low', label: 'Low Stock' },
              { value: 'out', label: 'Out of Stock' },
            ]}
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full md:w-48"
          />
          {onAddItem && (
            <Button onClick={onAddItem}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          )}
        </div>
      </Card>

      {/* Items List */}
      <Card>
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Items Found</h3>
            <p className="text-dark-400">
              {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                ? 'No items match your filters'
                : 'No inventory items have been added yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-500/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-dark-400">
                    Part Number
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-dark-400">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-dark-400">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-dark-400">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-dark-400">
                    Unit Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-dark-400">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isLowStock =
                    item.quantityInStock <= item.minimumStock &&
                    item.quantityInStock > 0;
                  const isOutOfStock = item.quantityInStock === 0;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onItemClick?.(item)}
                      className={cn(
                        'border-b border-primary-500/5 transition-colors',
                        onItemClick && 'cursor-pointer hover:bg-primary-500/5'
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-dark-300">
                          {item.partNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{item.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge size="sm">{item.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isOutOfStock
                                ? 'text-danger-500'
                                : isLowStock
                                ? 'text-warning-500'
                                : 'text-white'
                            )}
                          >
                            {item.quantityInStock}
                          </span>
                          <span className="text-xs text-dark-500">
                            / min {item.minimumStock}
                          </span>
                          {isOutOfStock && (
                            <Badge variant="danger" size="sm">
                              Out
                            </Badge>
                          )}
                          {isLowStock && (
                            <Badge variant="warning" size="sm">
                              Low
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-dark-300">
                          {formatCurrency(item.unitPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-dark-400">
                          {item.location || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
