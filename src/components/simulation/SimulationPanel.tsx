'use client';

import { ClassConfig } from '@/lib/data/classConfig';
import type { EquippedItems } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DengLevelKey } from '@/stores/simulationStore';

export interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;

  currentClass: string;
  bowType: string;
  setType: string;

  level: DengLevelKey;
  onLevelChange: (level: DengLevelKey) => void;

  equippedItems: EquippedItems;
  xinfaLoadout: string[];

  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;

  onXinfaClick: (slotIndex: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

const LEVEL_OPTIONS: DengLevelKey[] = ['80', '85', '90', '95', '100'] as unknown as DengLevelKey[];

const safeArray = <T,>(v: unknown, fallback: T[] = []): T[] =>
  Array.isArray(v) ? (v as T[]) : fallback;

const getBowOptions = (): string[] => {
  // essaie plusieurs noms possibles sans casser si absent
  const anyCfg = ClassConfig as any;
  return (
    safeArray<string>(anyCfg.BOW_TYPES) ||
    safeArray<string>(anyCfg.BOW_OPTIONS) ||
    ['precision']
  );
};

const getSetOptionsForClass = (cls: string, currentSet: string): string[] => {
  const anyCfg = ClassConfig as any;

  // Cas 1: un mapping sets par classe
  const byClass = anyCfg.SETS_BY_CLASS?.[cls] ?? anyCfg.SET_OPTIONS_BY_CLASS?.[cls];
  const arr = safeArray<string>(byClass);

  if (arr.length > 0) return arr;

  // Cas 2: fallback: au moins la valeur courante + défaut
  const dflt = anyCfg.DEFAULT_SETS?.[cls] ?? '';
  return Array.from(new Set([currentSet, dflt].filter(Boolean)));
};

export function SimulationPanel({
  expanded,
  onToggle,
  currentClass,
  bowType,
  setType,
  level,
  onLevelChange,
  equippedItems,
  xinfaLoadout,
  onClassChange,
  onBowChange,
  onSetChange,
  onXinfaClick,
  onUnequip,
}: SimulationPanelProps) {
  const classOptions = safeArray<string>((ClassConfig as any).CLASSES, [currentClass]).filter(Boolean);
  const bowOptions = getBowOptions();
  const setOptions = getSetOptionsForClass(currentClass, setType);

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
              {classOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
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
              {bowOptions.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Set</div>
          <Select value={setType} onValueChange={onSetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Level</div>
          <Select value={String(level)} onValueChange={(v) => onLevelChange(v as unknown as DengLevelKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((lv) => (
                <SelectItem key={String(lv)} value={String(lv)}>
                  {String(lv)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-border/40 pt-3 space-y-2">
        <div className="text-xs text-muted-foreground">Xinfa</div>
        <div className="grid grid-cols-4 gap-2">
          {xinfaLoadout.map((x, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => onXinfaClick(i)}>
              {x || `Slot ${i + 1}`}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t border-border/40 pt-3 space-y-2">
        <div className="text-xs text-muted-foreground">Equipped</div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(equippedItems) as Array<keyof EquippedItems>).map((slotKey) => (
            <div key={slotKey} className="border-border/60 rounded border p-2">
              <div className="text-[11px] text-muted-foreground">{slotKey}</div>
              <div className="text-xs truncate">{equippedItems[slotKey]?.name || '—'}</div>
              <Button
                className="mt-2"
                variant="secondary"
                size="sm"
                onClick={() => onUnequip(slotKey)}
              >
                Unequip
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}