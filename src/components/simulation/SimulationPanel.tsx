'use client';

import { ClassConfig } from '@/lib/data/classConfig';
import type { EquippedItems } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ✅ Le type doit venir d’UN seul endroit dans tout le projet.
// Si tu as déjà ce type dans levelStore (recommandé), importe-le depuis là.
import type { DengLevelKey } from '@/stores/levelStore';
// Si tu n’as PAS DengLevelKey dans levelStore, remplace la ligne ci-dessus par :
// import type { DengLevelKey } from '@/stores/simulationStore';

export interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;

  currentClass: string;
  bowType: string;
  setType: string;

  level: DengLevelKey;
  onLevelChange: (value: DengLevelKey) => void;

  equippedItems: EquippedItems;
  xinfaLoadout: string[];

  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;

  onXinfaClick: (slotIndex: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

// ✅ levels: retirés 60/70, gardés 80/85/90/95/100
const LEVEL_OPTIONS = ['80', '85', '90', '95', '100'] as unknown as DengLevelKey[];

const safeArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const bowOptions =
  (ClassConfig as any).BOW_OPTIONS ??
  (CommonData as any).BOW_OPTIONS ??
  ['precision', 'rapid', 'power']; // fallback multi-choix

  const a = safeArray<string>(anyCfg.BOW_TYPES);
  if (a.length) return a;

  const b = safeArray<string>(anyCfg.BOW_OPTIONS);
  if (b.length) return b;

  // fallback minimal
  return ['precision'];
};

const setOptions =
  (ClassConfig as any).SETS_BY_CLASS?.[currentClass] ??
  (ClassConfig as any).SETS?.[currentClass] ??
  (CommonData as any).SETS_BY_CLASS?.[currentClass] ??
  [setType].filter(Boolean);

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
  const classOptions = (() => {
    const arr = safeArray<string>((ClassConfig as any).CLASSES);
    const merged = Array.from(new Set([...arr, currentClass].filter(Boolean)));
    return merged.length ? merged : [currentClass];
  })();

  const bowOptions = (() => {
    const arr = getBowOptions();
    const merged = Array.from(new Set([...arr, bowType].filter(Boolean)));
    return merged.length ? merged : [bowType];
  })();

  const setOptions = (() => {
    const arr = getSetOptionsForClass(currentClass, setType);
    const merged = Array.from(new Set([...arr, setType].filter(Boolean)));
    return merged.length ? merged : [setType];
  })();

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
        {/* Class */}
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

        {/* Bow */}
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

        {/* Set */}
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

        {/* Level */}
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

      {/* Xinfa */}
      <div className="grid grid-cols-4 gap-2">
        {xinfaLoadout.map((x, idx) => (
          <Button key={idx} variant="outline" onClick={() => onXinfaClick(idx)} className="truncate">
            {x || `Slot ${idx + 1}`}
          </Button>
        ))}
      </div>

      {/* Unequip shortcuts (optionnel, exemple minimal) */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(equippedItems) as Array<keyof EquippedItems>).map((slotKey) => (
          <Button key={String(slotKey)} size="sm" variant="secondary" onClick={() => onUnequip(slotKey)}>
            Unequip {String(slotKey)}
          </Button>
        ))}
      </div>
    </section>
  );
}