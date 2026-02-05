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
  placeholder = 'Select stat',
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
          {options.map((stat) => (
            <SelectItem
              key={stat}
              value={stat}
              disabled={disabledOptions.includes(stat)}
            >
              {stat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Input
          type="number"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          placeholder="Value"
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
