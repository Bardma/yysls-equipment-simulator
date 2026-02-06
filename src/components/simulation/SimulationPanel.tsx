'use client';

import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClassConfig } from '@/lib/data/classConfig';
import { classLabel, setLabel, slotLabel, xinfaLabel } from '@/lib/statName';
import type { EquippedItems } from '@/lib/types';
import type { DengLevelKey } from '@/stores/simulationStore';

export interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;

  currentClass: string;
  bowType: string;
  armorSetType: string;
  setType: string;

  level: DengLevelKey;
  onLevelChange: (nextLevel: DengLevelKey) => void;

  equippedItems: EquippedItems;
  xinfaLoadout: string[];

  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onArmorSetChange: (value: string) => void;
  onSetChange: (value: string) => void;

  onXinfaClick: (slotIndex: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

const LEVEL_OPTIONS: DengLevelKey[] = ['80', '85', '90', '95', '100'] as unknown as DengLevelKey[];
const DEFAULT_BOW_OPTIONS = ['precision', 'balanced', 'rapid'];

const ARMOR_SET_OPTIONS = ['断岳', '燕归', '连星', '撼天'];
const WEAPON_SET_OPTIONS = ['玉斗', '飞隼', '时雨', '烟柳', '浣花'];

export function SimulationPanel(props: SimulationPanelProps) {
  const {
    expanded,
    onToggle,
    currentClass,
    bowType,
    armorSetType,
    setType,
    level,
    onLevelChange,
    equippedItems,
    xinfaLoadout,
    onClassChange,
    onBowChange,
    onArmorSetChange,
    onSetChange,
    onXinfaClick,
    onUnequip,
  } = props;

  const classOptions = useMemo(
    () => (ClassConfig.CLASSES.length ? ClassConfig.CLASSES : [currentClass]),
    [currentClass]
  );

  const bowOptions = useMemo(() => {
    const options = Array.from(new Set([...DEFAULT_BOW_OPTIONS, bowType].filter(Boolean)));
    return options.length ? options : DEFAULT_BOW_OPTIONS;
  }, [bowType]);

  if (!expanded) {
    return (
      <section className="border-border/60 bg-card rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Simulation</div>
          <Button variant="outline" size="sm" onClick={onToggle}>
            Show
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="border-border/60 bg-card rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Simulation</div>
        <Button variant="outline" size="sm" onClick={onToggle}>
          Hide
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Class</div>
          <Select value={currentClass} onValueChange={onClassChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {classLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Bow</div>
          <Select value={bowType} onValueChange={onBowChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bowOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Armor Set</div>
          <Select value={armorSetType} onValueChange={onArmorSetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARMOR_SET_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {setLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Weapon Set</div>
          <Select value={setType} onValueChange={onSetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEAPON_SET_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {setLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 col-span-2">
          <div className="text-xs text-muted-foreground">Level</div>
          <Select value={String(level)} onValueChange={(v) => onLevelChange(v as unknown as DengLevelKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={String(option)} value={String(option)}>
                  {String(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Innerway</div>
        <div className="grid grid-cols-2 gap-2">
          {xinfaLoadout.map((name, index) => (
            <Button key={`${name}-${index}`} variant="outline" onClick={() => onXinfaClick(index)}>
              {name ? xinfaLabel(name) : `Slot ${index + 1}`}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Equipped</div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(equippedItems) as Array<keyof EquippedItems>).map((slotKey) => (
            <div key={slotLabel(String(slotKey))} className="border-border/60 rounded-md border p-2">
              <div className="text-xs text-muted-foreground">{slotLabel(String(slotKey))}</div>
              <div className="truncate">{equippedItems[slotKey]?.name ?? '—'}</div>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onUnequip(slotKey)}>
                Unequip
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
