// AJOUTE en haut
import { Calculator } from '@/lib/calculator';
export type DengLevelKey = Parameters<typeof Calculator.calculateTotal>[8];

// Dans GraduationModalProps
interface GraduationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  db: EquipItem[];
  equippedItems: EquippedItems;
  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;

  // ✅ NEW
  level: DengLevelKey;

  onApplyBuild: (equips: EquippedItems) => void;
}

// Dans les props du composant
export const GraduationModal = ({
  open,
  onOpenChange,
  db,
  equippedItems,
  currentClass,
  bowType,
  setType,
  xinfaLoadout,
  earlySeasonBonus,
  level,          // ✅ NEW
  onApplyBuild,
}: GraduationModalProps) => {
  // ... ton code

  const accTotals = Calculator.calculateTotal(
    equippedItems,
    currentClass,
    bowType,
    xinfaLoadout,
    setType,
    false,
    null,
    earlySeasonBonus,
    level          // ✅ OK
  );

  // ... ton code
};