'use client';

import type { EquippedItems } from '@/lib/types';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;

  currentClass: string;
  bowType: string;
  setType: string;

  // Level dropdown
  level: string;
  onLevelChange: (value: string) => void;

  equippedItems: EquippedItems;
  xinfaLoadout: string[];

  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;

  onXinfaClick: (idx: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

// NOTE: tu as demandé de retirer 60/70 et d’avoir 85/95 -> on met la liste ici.
const LEVEL_OPTIONS = ['80', '85', '90', '95', '100'] as const;

// IMPORTANT: je ne “force” pas ici une traduction class/bow/set.
// Je répare le dropdown (fonctionnel). La traduction CN->EN se fait via mapping (voir section 2).
export const SimulationPanel = ({
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
}: SimulationPanelProps) => {
  return (
    <div className="rounded-xl border border-border/40 bg-background/40 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="font-semibold">Simulation</div>
        <button
          type="button"
          onClick={onToggle}
          className="text-xs px-2 py-1 rounded-md border border-border/40 hover:bg-muted/40"
        >
          {expanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Top controls */}
          <div className="grid grid-cols-2 gap-3">
            {/* Class */}
            <div className="space-y-1.5">
              <Label className="text-xs">Class</Label>
              <Select value={currentClass} onValueChange={onClassChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {/* options: on affiche les valeurs existantes via un set simple.
                      Si tu as une liste officielle ailleurs, remplace ce bloc par ta source.
                  */}
                  {[currentClass]
                    .concat([]) // laisse ici, on évite de crasher si aucune liste globale
                    .filter(Boolean)
                    .map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bow */}
            <div className="space-y-1.5">
              <Label className="text-xs">Bow</Label>
              <Select value={bowType} onValueChange={onBowChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select bow" />
                </SelectTrigger>
                <SelectContent>
                  {/* Idem: si tu as une liste, injecte-la. */}
                  {[bowType]
                    .concat([])
                    .filter(Boolean)
                    .map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Set */}
            <div className="space-y-1.5">
              <Label className="text-xs">Set</Label>
              <Select value={setType} onValueChange={onSetChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select set" />
                </SelectTrigger>
                <SelectContent>
                  {[setType]
                    .concat([])
                    .filter(Boolean)
                    .map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <Label className="text-xs">Level</Label>
              <Select value={level} onValueChange={onLevelChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((lv) => (
                    <SelectItem key={lv} value={lv}>
                      {lv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Xinfa */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Xinfa</div>
            <div className="grid grid-cols-4 gap-2">
              {xinfaLoadout.map((name, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onXinfaClick(idx)}
                  className="rounded-lg border border-border/40 bg-background/40 hover:bg-muted/40 px-2 py-2 text-left"
                >
                  <div className="text-[10px] text-muted-foreground">Slot {idx + 1}</div>
                  <div className="text-xs font-medium truncate">{name || '—'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Equipped quick actions */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Equipped</div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(equippedItems) as Array<keyof EquippedItems>).map((slotKey) => {
                const item = equippedItems[slotKey];
                return (
                  <div
                    key={slotKey}
                    className="rounded-lg border border-border/40 bg-background/30 p-2"
                  >
                    <div className="text-[10px] text-muted-foreground">{slotKey}</div>
                    <div className="text-xs truncate">{item?.name || '—'}</div>
                    <button
                      type="button"
                      onClick={() => onUnequip(slotKey)}
                      className="mt-2 w-full text-xs rounded-md border border-border/40 hover:bg-muted/40 py-1"
                    >
                      Unequip
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};