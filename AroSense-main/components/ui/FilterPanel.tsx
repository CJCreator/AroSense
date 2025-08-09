import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface FilterOption {
  id: string;
  label: string;
  value: any;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange' | 'toggle';
  options?: FilterOption[];
}

interface FilterPanelProps {
  filters: FilterGroup[];
  values: Record<string, any>;
  onChange: (filterId: string, value: any) => void;
  onReset: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onReset,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderFilter = (filter: FilterGroup) => {
    const value = values[filter.id];

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All</option>
            {filter.options?.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filter.options?.map(option => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value?.includes(option.value) || false}
                  onChange={(e) => {
                    const current = value || [];
                    const updated = e.target.checked
                      ? [...current, option.value]
                      : current.filter((v: any) => v !== option.value);
                    onChange(filter.id, updated);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'daterange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => onChange(filter.id, { ...value, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => onChange(filter.id, { ...value, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            />
          </div>
        );

      case 'toggle':
        return (
          <button
            onClick={() => onChange(filter.id, !value)}
            className={`w-full px-3 py-2 rounded-md border transition-colors ${
              value
                ? 'bg-primary-100 border-primary-300 text-primary-700'
                : 'bg-gray-50 border-gray-300 text-gray-700'
            }`}
          >
            {value ? 'Enabled' : 'Disabled'}
          </button>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(values).some(v => 
    v && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <Card className={className}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {filters.map(filter => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                {renderFilter(filter)}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};