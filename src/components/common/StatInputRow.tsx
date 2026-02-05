'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const statLabel = (stat: unknown): string => {
  if (typeof stat === 'string') return stat;
  if (typeof stat === 'number') return String(stat);

  if (stat && typeof stat === 'object') {
    const s = stat as Record<string, unknown>;
    if (typeof s.label === 'string') return s.label;
    if (typeof s.value === 'string') return s.value;
    if (typeof s.type === 'string') return s.type;
    if (typeof s.key === 'string') return s.key;
  }

  return '';
};

interface StatInputRowProps {
  type: string;
  value: string;
  options: string[];
  disabledOptions?: string[];
  disabled?: boolean;
  placeholder?: string;
  onTypeChange: (type: string) => void;
  onValueChange: (value: string) => void;
  onMaxClick: () => void;
  maxDisabled?: boolean;
}

export const StatInputRow = ({
  type,
  value,
  options,
  disabledOptions = [],
  disabled = false,
  placeholder = '选择词条',
  onTypeChange,
  onValueChange,
  onMaxClick,
  maxDisabled = false,
}: StatInputRowProps) => {
  return (
    <div className="grid grid-cols-[1.2fr_0.8fr] gap-2">
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((stat) => {
  const label = statLabel(stat);

  return (
    <SelectItem
      key={label}
      value={label}
      disabled={disabledOptions.includes(label)}
    >
      {label}
    </SelectItem>
  );
})}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Input
          type="number"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          placeholder="数值"
        />
        <Button
          variant="outline"
          type="button"
          disabled={maxDisabled}
          onClick={onMaxClick}
        >
          ↑
        </Button>
      </div>
    </div>
  );
};
