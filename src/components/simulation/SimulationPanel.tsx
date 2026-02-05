'use client';

import { useTranslations } from 'next-intl';
import type { EquippedItems } from '@/lib/types';
import { Calculator } from '@/lib/calculator';
import { CommonData } from '@/lib/data/commonData';

export type DengLevelKey = Parameters<typeof Calculator.calculateTotal>[8];

// SimulationPanelProps
export interface SimulationPanelProps {
  expanded: boolean;
  onToggle: () => void;
  currentClass: string;
  bowType: string;
  setType: string;
  level: DengLevelKey;
  onLevelChange: (level: DengLevelKey) => void;  // obligatoire
  // …autres props…
}

// SimulationPanel: implémentez un <select> ou un champ permettant de changer le niveau,
// puis appelez onLevelChange lorsque l’utilisateur modifie la valeur.

  equippedItems: EquippedItems;
  xinfaLoadout: string[];

  onClassChange: (value: string) => void;
  onBowChange: (value: string) => void;
  onSetChange: (value: string) => void;
  onXinfaClick: (idx: number) => void;
  onUnequip: (slotKey: keyof EquippedItems) => void;
}

export function SimulationPanel(props: SimulationPanelProps) {
  const t = useTranslations('simulation');

  // Si tu as déjà une liste officielle dans CommonData, on l’utilise, sinon fallback
  const levelOptions: Array<{ label: string; value: DengLevelKey }> =
    ((CommonData as any).DENG_LEVEL_OPTIONS as Array<{ label: string; value: DengLevelKey }>) ??
    (['70', '80', '100'] as unknown as DengLevelKey[]).map((v) => ({ label: String(v), value: v }));

  return (
    <div className="border-border/60 bg-card rounded-lg border">
      {/* header / toggle etc ... garde ton code */}
      <div className="flex items-center justify-between p-3">
        <div className="font-semibold">{t('title')}</div>
        <button onClick={props.onToggle} className="text-xs opacity-70 hover:opacity-100">
          {props.expanded ? t('collapse') : t('expand')}
        </button>
      </div>

      {props.expanded && (
        <div className="p-3 space-y-3">
          {/* ... tes selects classe / arc / set etc */}

          {/* LEVEL (nouveau) */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{t('level') ?? 'Level'}</div>
            <select
              className="w-full border border-border/60 bg-background rounded-md px-2 py-1 text-sm"
              value={String(props.level)}
              onChange={(e) => props.onLevelChange(e.target.value as unknown as DengLevelKey)}
            >
              {levelOptions.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* ... le reste de ton panel */}
        </div>
      )}
    </div>
  );
}