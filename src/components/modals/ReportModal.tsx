import { Calculator } from '@/lib/calculator';
type DengLevelKey = Parameters<typeof Calculator.calculateTotal>[8];

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string | null;
  currentClass: string;
  setType: string;

  // ✅ NEW
  level: DengLevelKey;

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