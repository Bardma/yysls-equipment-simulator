'use client';

import { Button } from '@/components/ui/button';
import { CommonData } from '@/lib/data/commonData';
import { cn } from '@/lib/utils';

interface EquipmentFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const EquipmentFilter = ({ filter, onFilterChange }: EquipmentFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        className={cn(
          'cursor-pointer transition-all',
          filter === 'all'
            ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-sm'
            : 'bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 border-slate-500/30'
        )}
        variant={filter === 'all' ? 'default' : 'outline'}
        onClick={() => onFilterChange('all')}
      >
        全部
      </Button>
      {CommonData.SLOTS.map((slot) => (
        <Button
          key={slot.id}
          size="sm"
          className={cn(
            'cursor-pointer transition-all',
            filter === slot.id
              ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-sm'
              : 'bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 border-slate-500/30'
          )}
          variant={filter === slot.id ? 'default' : 'outline'}
          onClick={() => onFilterChange(slot.id)}
        >
          {slot.name}
        </Button>
      ))}
    </div>
  );
};
