'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';

const BOW_OPTIONS = [
  { value: 'precision', label: '精准弓' },
  { value: 'crit', label: '会心弓' },
  { value: 'intent', label: '会意弓' },
];

interface ClassSelectorProps {
  currentClass: string;
  bowType: string;
  setType: string;
  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;
}

export const ClassSelector = ({
  currentClass,
  bowType,
  setType,
  onClassChange,
  onBowChange,
  onSetChange,
}: ClassSelectorProps) => {
  return (
    <div className="flex justify-between gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sky-300/80 text-xs font-medium">流派</label>
        <Select value={currentClass} onValueChange={onClassChange}>
          <SelectTrigger className="cursor-pointer w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ClassConfig.CLASSES.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sky-300/80 text-xs font-medium">弓诀</label>
        <Select value={bowType} onValueChange={onBowChange}>
          <SelectTrigger className="cursor-pointer w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOW_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sky-300/80 text-xs font-medium">套装</label>
        <Select value={setType} onValueChange={onSetChange}>
          <SelectTrigger className="cursor-pointer w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(CommonData.SET_DATA).map((setName) => (
              <SelectItem key={setName} value={setName}>
                {setName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export { BOW_OPTIONS };
