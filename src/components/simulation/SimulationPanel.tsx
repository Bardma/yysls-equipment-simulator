'use client';

import { useTranslations } from 'next-intl';

import { CollapsibleCard } from '@/components/common/CollapsibleCard';
import { EquipmentSlot } from '@/components/equipment/EquipmentSlot';
import { ClassConfig } from '@/lib/data/classConfig';
import type { EquipItem, EquippedItems } from '@/lib/types';

import { ClassSelector } from './ClassSelector';
import { XinfaSlot } from './XinfaSlot';

interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;
  currentClass: string;
  bowType: string;
  setType: string;
  level: import('@/lib/levelBaseStats').DengLevelKey;
  equippedItems: EquippedItems;
  xinfaLoadout: string[];
  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;
  onLevelChange: (value: import('@/lib/levelBaseStats').DengLevelKey) => void;
  onXinfaClick: (index: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

const LEFT_SLOTS: Array<keyof EquippedItems> = [
  'weapon1',
  'weapon2',
  'ring',
  'pendant',
];

const RIGHT_SLOTS: Array<keyof EquippedItems> = [
  'head',
  'chest',
  'legs',
  'hands',
];

export const SimulationPanel = ({
  expanded,
  onToggle,
  currentClass,
  bowType,
  setType,
  equippedItems,
  xinfaLoadout,
  onClassChange,
  onBowChange,
  onSetChange,
  level,
  onLevelChange,
  onXinfaClick,
  onUnequip,
}: SimulationPanelProps) => {
  const t = useTranslations('simulation');
  const lockedList = ClassConfig.XINFA_LOCKED[currentClass] || [];

  return (
    <CollapsibleCard
      title={t('title')}
      icon="⚔"
      expanded={expanded}
      onToggle={onToggle}
      themeColor="sky"
    >
      <div className="space-y-4">
        <ClassSelector
          currentClass={currentClass}
          bowType={bowType}
          setType={setType}
          onClassChange={onClassChange}
          onBowChange={onBowChange}
          onSetChange={onSetChange}
        level={level}
        onLevelChange={onLevelChange}
        />

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
          <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 sm:gap-3">
            {LEFT_SLOTS.map((slotKey) => (
              <EquipmentSlot
                key={slotKey}
                slotKey={slotKey}
                item={equippedItems[slotKey]}
                onUnequip={onUnequip}
              />
            ))}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 sm:gap-3">
            {RIGHT_SLOTS.map((slotKey) => (
              <EquipmentSlot
                key={slotKey}
                slotKey={slotKey}
                item={equippedItems[slotKey]}
                onUnequip={onUnequip}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sky-300/80 text-xs font-medium">{t('xinfaConfig')}</div>
          <div className="grid grid-cols-4 gap-2 sm:flex sm:justify-between">
            {Array.from({ length: 4 }).map((_, idx) => {
              const name = xinfaLoadout[idx] || '';
              const isLocked = !!name && lockedList.includes(name);
              return (
                <XinfaSlot
                  key={`xinfa-${idx}`}
                  index={idx}
                  name={name}
                  isLocked={isLocked}
                  onClick={() => onXinfaClick(idx)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </CollapsibleCard>
  );
};
