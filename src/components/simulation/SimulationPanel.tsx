'use client';

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
  equippedItems: EquippedItems;
  xinfaLoadout: string[];
  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;
  onXinfaClick: (index: number) => void;
}

const SLOT_ORDER: Array<keyof EquippedItems> = [
  'weapon1',
  'weapon2',
  'head',
  'chest',
  'ring',
  'pendant',
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
  onXinfaClick,
}: SimulationPanelProps) => {
  const lockedList = ClassConfig.XINFA_LOCKED[currentClass] || [];

  return (
    <CollapsibleCard
      title="穿戴模拟"
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
        />

        <div className="grid grid-cols-4 gap-2">
          {SLOT_ORDER.map((slotKey) => (
            <EquipmentSlot
              key={slotKey}
              slotKey={slotKey}
              item={equippedItems[slotKey]}
            />
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sky-300/80 text-xs font-medium">心法配置</div>
          <div className="grid grid-cols-4 gap-2">
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
