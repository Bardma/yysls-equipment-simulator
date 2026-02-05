'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type AnyStat = unknown;

const statKey = (stat: AnyStat): string => {
  if (typeof stat === 'string') return stat;
  if (stat && typeof stat === 'object') {
    const s = stat as any;
    return String(s.type ?? s.label ?? s.name ?? '');
  }
  return String(stat ?? '');
};

// Mapping d’affichage (ajoute ce que tu veux)
const STAT_LABEL_EN: Record<string, string> = {
  '最大外功攻击': 'Max External Attack',
  '最小外功攻击': 'Min External Attack',
  '最大无相攻击': 'Max WuXiang Attack',
  '最小无相攻击': 'Min WuXiang Attack',
  '劲': 'Strength',
  '敏': 'Agility',
  '势': 'Poise',
  '精准率': 'Accuracy',
  '会心率': 'Crit Rate',
  '会意率': 'Crit DMG Rate',
  '直接会心率': 'Direct Crit Rate',
  '直接会意率': 'Direct Crit DMG Rate',
  '会心伤害加成': 'Crit DMG Bonus',
  '会意伤害加成': 'Crit DMG Bonus (Yi)',
  '属攻穿透': 'Elemental Penetration',
  '鸣金伤害加成': 'Metal DMG Bonus',
  '生存类词条': 'Survival',
  '生存向': 'Survival',
};

const statLabelEn = (key: string) => STAT_LABEL_EN[key] ?? key;

export interface StatInputRowProps {
  options: AnyStat[];
  value: string;
  disabledOptions?: string[];
  onValueChange: (value: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  placeholder?: string;
}

export const StatInputRow = ({
  options,
  value,
  disabledOptions = [],
  onValueChange,
  inputValue,
  onInputChange,
  placeholder,
}: StatInputRowProps) => {
  return (
    <div className="grid grid-cols-[1fr_140px] gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder ?? 'Select Stat'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((stat) => {
            const key = statKey(stat);
            return (
              <SelectItem
                key={key}
                value={key}
                disabled={disabledOptions.includes(key)}
              >
                {statLabelEn(key)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Input
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Value"
      />
    </div>
  );
};