// src/components/modals/ReportModal.tsx
import html2canvas from 'html2canvas-pro';
import { Calculator } from '@/lib/calculator';
import type { EquippedItems } from '@/lib/types';
// …autres imports…

export type DengLevelKey = Parameters<typeof Calculator.calculateTotal>[8];

export interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string | null;
  currentClass: string;
  setType: string;
  level: DengLevelKey;        // ← ajoutez level ici
  xinfaLoadout: string[];
  graduationInfo: {
    accurate: string;
    excel: string;
    dps: number;
  } | null;
  statDisplay: Array<{
    label: string;
    value: string;
    highlight?: string;
    suffix?: string;
    isLoaned?: boolean;
    isEarlySeason?: boolean;
  }>;
  earlySeasonBonus: boolean;
  loanDingyin: boolean;
}

export const ReportModal = ({
  open,
  onOpenChange,
  accountName,
  currentClass,
  setType,
  level,
  xinfaLoadout,
  graduationInfo,
  statDisplay,
  earlySeasonBonus,
  loanDingyin,
}: ReportModalProps) => {
  // …votre logique d’affichage…
};