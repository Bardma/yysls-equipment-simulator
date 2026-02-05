'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EquippedItems } from '@/lib/types';
import type { DengLevelKey } from '@/stores/levelStore';

export interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;

  currentClass: string;
  bowType: string;
  setType: string;
  level: DengLevelKey;

  equippedItems: EquippedItems;
  xinfaLoadout: string[];

  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;
  onLevelChange: (value: DengLevelKey) => void;

  onXinfaClick: (idx: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

// Ajuste si tu veux d'autres paliers
const LEVEL_OPTIONS = ['60', '70', '80', '90', '100'] as unknown as DengLevelKey[];

export const SimulationPanel = ({
  expanded,
  onToggle,
  currentClass,
  bowType,
  setType,
  level,
  equippedItems,
  xinfaLoadout,
  onClassChange,
  onBowChange,
  onSetChange,
  onLevelChange,
  onXinfaClick,
  onUnequip,
}: SimulationPanelProps) => {
  if (!expanded) {
    return (
      <section className="border-border/60 bg-card rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Simulation</div>
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
        <div className="text-sm font-medium">Simulation</div>
        <Button variant="outline" size="sm" onClick={onToggle}>
          Hide
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Class</div>
          {/* tu as déjà ton select class ailleurs ; ici on garde simple */}
          <input
            className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm"
            value={currentClass}
            onChange={(e) => onClassChange(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Bow</div>
          <input
            className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm"
            value={bowType}
            onChange={(e) => onBowChange(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Set</div>
          <input
            className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm"
            value={setType}
            onChange={(e) => onSetChange(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Level</div>
          <Select
            value={String(level)}
            onValueChange={(v) => onLevelChange(v as unknown as DengLevelKey)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select level" />
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

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Xinfa</div>
        <div className="grid grid-cols-2 gap-2">
          {xinfaLoadout.map((x, idx) => (
            <button
              key={idx}
              className="border-border/60 bg-background hover:bg-accent/20 rounded-md border px-2 py-2 text-left text-sm"
              onClick={() => onXinfaClick(idx)}
            >
              <div className="text-[10px] text-muted-foreground">Slot {idx + 1}</div>
              <div className="truncate">{x || '-'}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Equipped</div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(equippedItems) as Array<keyof EquippedItems>).map((k) => (
            <div key={k} className="border-border/60 bg-background rounded-md border p-2">
              <div className="text-[10px] text-muted-foreground">{k}</div>
              <div className="truncate text-sm">{equippedItems[k]?.name || '-'}</div>
              <Button
                className="mt-2 w-full"
                variant="outline"
                size="sm"
                onClick={() => onUnequip(k)}
              >
                Unequip
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};