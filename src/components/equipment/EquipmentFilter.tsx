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
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      <Button
        size="sm"
        className={cn(
          'cursor-pointer transition-all text-xs sm:text-sm px-2.5 sm:px-3 h-7 sm:h-8',
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
            'cursor-pointer transition-all text-xs sm:text-sm px-2.5 sm:px-3 h-7 sm:h-8',
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
