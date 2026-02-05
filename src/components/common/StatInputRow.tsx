'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StatOption =
  | string
  | {
      label?: string;
      name?: string;
      type?: string;
      value?: string;
      key?: string;
      id?: string | number;
    };

// Helper: always return a stable string label for a stat option
const statLabel = (stat: StatOption): string => {
  if (typeof stat === 'string') return stat;

  // try common fields in order of likelihood
  const candidate =
    stat.label ??
    stat.name ??
    stat.type ??
    stat.value ??
    stat.key ??
    (stat.id !== undefined ? String(stat.id) : '');

  return candidate || '';
};

interface StatInputRowProps {
  label?: string;

  // current selected stat key/label
  stat: string;
  onStatChange: (value: string) => void;

  // numeric input value
  value: string | number;
  onValueChange: (value: string) => void;

  options: StatOption[];

  // optional disabling
  disabled?: boolean;
  disabledOptions?: StatOption[];

  // optional UI hints
  placeholder?: string;
  valuePlaceholder?: string;
}

export function StatInputRow({
  label,
  stat,
  onStatChange,
  value,
  onValueChange,
  options,
  disabled = false,
  disabledOptions = [],
  placeholder = '—',
  valuePlaceholder = '',
}: StatInputRowProps) {
  const disabledLabels = new Set(disabledOptions.map((s) => statLabel(s)));

  return (
    <div className="flex items-center gap-2">
      {label ? <div className="text-sm text-muted-foreground w-24">{label}</div> : null}

      <Select value={stat} onValueChange={onStatChange} disabled={disabled}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => {
            const label = statLabel(opt);
            if (!label) return null;

            return (
              <SelectItem
                key={label}
                value={label}
                disabled={disabledLabels.has(label)}
              >
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Input
        className="w-[120px]"
        value={value}
        placeholder={valuePlaceholder}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}