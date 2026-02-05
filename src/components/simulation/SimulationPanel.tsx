'use client';

import type { EquippedItems } from '@/lib/types';

export type DengLevelKey = NonNullable<
  Parameters<typeof import('@/lib/calculator').Calculator.calculateTotal>[8]
>;

export interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;

  currentClass: string;
  bowType: string;
  setType: string;

  level: DengLevelKey;
  onLevelChange?: (next: DengLevelKey) => void;

  equippedItems: EquippedItems;
  xinfaLoadout: string[];

  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;

  onXinfaClick: (idx: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

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
  // UI minimaliste volontaire (compile sûr). Tu peux re-styler ensuite.
  return (
    <section className="border-border/60 bg-card rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">Simulation</div>
        <button
          type="button"
          onClick={onToggle}
          className="text-xs px-2 py-1 rounded border border-border/60"
        >
          {expanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="text-sm">
              <div className="text-xs text-muted-foreground mb-1">Class</div>
              <input
                value={currentClass}
                onChange={(e) => onClassChange(e.target.value)}
                className="w-full rounded border border-border/60 bg-background px-2 py-1 text-sm"
              />
            </label>

            <label className="text-sm">
              <div className="text-xs text-muted-foreground mb-1">Bow</div>
              <input
                value={bowType}
                onChange={(e) => onBowChange(e.target.value)}
                className="w-full rounded border border-border/60 bg-background px-2 py-1 text-sm"
              />
            </label>

            <label className="text-sm">
              <div className="text-xs text-muted-foreground mb-1">Set</div>
              <input
                value={setType}
                onChange={(e) => onSetChange(e.target.value)}
                className="w-full rounded border border-border/60 bg-background px-2 py-1 text-sm"
              />
            </label>

            <label className="text-sm">
              <div className="text-xs text-muted-foreground mb-1">Level</div>
              <input
                value={String(level)}
                onChange={(e) => {
                  if (!onLevelChange) return;
                  // On cast volontairement: DengLevelKey est un union literal côté Calculator.
                  onLevelChange(e.target.value as unknown as DengLevelKey);
                }}
                className="w-full rounded border border-border/60 bg-background px-2 py-1 text-sm"
              />
            </label>
          </div>

          <div className="rounded border border-border/60 p-2">
            <div className="text-xs text-muted-foreground mb-2">Xinfa</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {xinfaLoadout.map((x, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onXinfaClick(idx)}
                  className="rounded border border-border/60 px-2 py-2 text-xs text-left"
                  title={x || 'Empty'}
                >
                  <div className="text-muted-foreground">Slot {idx + 1}</div>
                  <div className="font-medium truncate">{x || '—'}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded border border-border/60 p-2">
            <div className="text-xs text-muted-foreground mb-2">Equipped</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(Object.keys(equippedItems) as Array<keyof EquippedItems>).map((k) => {
                const item = equippedItems[k];
                return (
                  <div key={String(k)} className="rounded border border-border/60 p-2">
                    <div className="text-muted-foreground">{String(k)}</div>
                    <div className="truncate font-medium">{item?.name || '—'}</div>
                    <button
                      type="button"
                      onClick={() => onUnequip(k)}
                      className="mt-2 text-[11px] px-2 py-1 rounded border border-border/60"
                      disabled={!item}
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
    </section>
  );
};