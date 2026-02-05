'use client';

import { ClassConfig } from '@/lib/data/classConfig';
import type { EquippedItems } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DengLevelKey } from '@/stores/simulationStore';
import { classLabel, setLabel } from '@/lib/statName';
import { CommonData } from '@/lib/data/commonData';
import { useMemo } from 'react';

export interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;

  currentClass: string;
  bowType: string;
  setType: string;

  level: DengLevelKey;
  onLevelChange: (nextLevel: DengLevelKey) => void;

  equippedItems: EquippedItems;
  xinfaLoadout: string[];

  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;

  onXinfaClick: (slotIndex: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

// 60/70 retirés + ajout 85/95
const LEVEL_OPTIONS: DengLevelKey[] = ['80', '85', '90', '95', '100'] as unknown as DengLevelKey[];

const safeArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const firstNonEmpty = <T,>(...candidates: T[][]): T[] => {
  for (const arr of candidates) if (arr && arr.length) return arr;
  return [];
};

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const getClassOptions = (currentClass: string): string[] => {
  const anyCfg = ClassConfig as any;
  const fromCfg = safeArray<string>(anyCfg.CLASSES);
  return uniq(fromCfg.length ? fromCfg : [currentClass]);
};

const getBowOptions = (currentBow: string): string[] => {
  const anyCfg = ClassConfig as any;

  // essaye plusieurs sources possibles
  const fromCfg = firstNonEmpty<string>(
    safeArray<string>(anyCfg.BOW_TYPES),
    safeArray<string>(anyCfg.BOW_OPTIONS),
    safeArray<string>(anyCfg.BOWS)
  );

  // fallback propre si rien trouvé
  const fallback = ['precision', 'balanced', 'rapid'];

  return uniq((fromCfg.length ? fromCfg : fallback).concat([currentBow]));
};

const getSetOptionsForClass = (cls: string, currentSet: string): string[] => {
  const anyCfg = ClassConfig as any;

  // cas 1: mapping par classe
  const byClass = anyCfg.SETS_BY_CLASS?.[cls] ?? anyCfg.SET_OPTIONS_BY_CLASS?.[cls] ?? anyCfg.CLASS_SETS?.[cls];
  const fromClass = safeArray<string>(byClass);

  // cas 2: liste globale
  const fromGlobal = firstNonEmpty<string>(
    safeArray<string>(anyCfg.ALL_SETS),
    safeArray<string>(anyCfg.SETS),
    safeArray<string>(anyCfg.SET_OPTIONS)
  );

  const dflt = String(anyCfg.DEFAULT_SETS?.[cls] ?? '');

  const base = fromClass.length ? fromClass : fromGlobal;
  return uniq(base.concat([currentSet, dflt]));
};

export function SimulationPanel(props: SimulationPanelProps) {
  const {
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
  } = props;

  const classOptions = getClassOptions(currentClass);
  const bowOptions = getBowOptions(bowType);
const setOptions = useMemo(() => {
  // sets configurés pour la classe + tous les sets connus
  const fromCfg = getSetOptionsForClass(currentClass);
  const fromCommon = Object.keys(CommonData.SET_DATA ?? {});

  // set courant en 1er, puis le reste, sans doublons
  return Array.from(new Set([setType, ...fromCfg, ...fromCommon].filter(Boolean)));
}, [currentClass, setType]);
  // met le set courant en premier + évite doublons
  return Array.from(new Set([...current, ...all]));
}, [setType]);

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
                      {classLabel(c)}
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
              {setOptions.map((set) => (
  <SelectItem key={set} value={set}>
    {setLabel(set)}
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

      {/* Le reste de ton panel (xinfa, equipped, unequip) reste inchangé */}
      {/* IMPORTANT: garde ton code existant ci-dessous si tu en avais */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Xinfa</div>
        <div className="grid grid-cols-2 gap-2">
          {xinfaLoadout.map((x, idx) => (
            <Button key={`${x}-${idx}`} variant="outline" onClick={() => onXinfaClick(idx)}>
              {x || `Slot ${idx + 1}`}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Equipped</div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(equippedItems) as Array<keyof EquippedItems>).map((slotKey) => (
            <div key={String(slotKey)} className="border-border/60 rounded-md border p-2">
              <div className="text-xs text-muted-foreground">{String(slotKey)}</div>
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