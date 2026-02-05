'use client';

import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import { DENG_LEVEL_OPTIONS } from '@/lib/levelBaseStats';

const BOW_OPTIONS = [
  { value: 'precision', labelKey: 'precisionBow' },
  { value: 'crit', labelKey: 'critBow' },
  { value: 'intent', labelKey: 'intentBow' },
];

interface ClassSelectorProps {
  currentClass: string;
  bowType: string;
  setType: string;
  level: import('@/lib/levelBaseStats').DengLevelKey;
  onLevelChange: (value: import('@/lib/levelBaseStats').DengLevelKey) => void;
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
  level,
  onLevelChange,
}: ClassSelectorProps) => {
  const t = useTranslations('simulation');

  return (
    <div className="grid grid-cols-4 gap-2 sm:flex sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sky-300/80 text-xs font-medium">{t('class')}</label>
        <Select value={currentClass} onValueChange={onClassChange}>
          <SelectTrigger className="cursor-pointer w-full sm:w-28 h-8 text-xs">
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
        <label className="text-sky-300/80 text-xs font-medium">{t('bowType')}</label>
        <Select value={bowType} onValueChange={onBowChange}>
          <SelectTrigger className="cursor-pointer w-full sm:w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOW_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sky-300/80 text-xs font-medium">{t('setBonus')}</label>
        <Select value={setType} onValueChange={onSetChange}>
          <SelectTrigger className="cursor-pointer w-full sm:w-28 h-8 text-xs">
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
      
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{t('level')}</span>
        <Select value={level} onValueChange={(v) => onLevelChange(v as any)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t('level')} />
          </SelectTrigger>
          <SelectContent>
            {DENG_LEVEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
</div>
    </div>
  );
};

export { BOW_OPTIONS };
