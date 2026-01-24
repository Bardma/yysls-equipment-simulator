"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CommonData } from "../../lib/data/commonData";
import type { EquipItem } from "../../lib/types";

interface EquipPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotId: string;
  weaponTypeId?: string | null;
  db: EquipItem[];
  onSelect: (item: EquipItem) => void;
}

const getScore = (equip: EquipItem) => {
  if (equip.isChengyin) return "94.0%";
  let totalPct = 0;
  let count = 0;
  if (equip.mainStat && equip.mainStat.type !== "生存类词条" && equip.mainStat.type !== "生存向") {
    const mMax = CommonData.MAX_VALUES[equip.mainStat.type];
    if (mMax) {
      totalPct += equip.mainStat.value / mMax;
      count++;
    }
  }
  equip.subStats.forEach((sub) => {
    if (sub.type !== "生存类词条" && sub.type !== "生存向") {
      const sMax = CommonData.MAX_VALUES[sub.type];
      if (sMax) {
        totalPct += sub.value / sMax;
        count++;
      }
    }
  });
  return count > 0 ? `${((totalPct / count) * 100).toFixed(1)}%` : "0.0%";
};

export const EquipPickerModal = ({
  open,
  onOpenChange,
  slotId,
  weaponTypeId,
  db,
  onSelect,
}: EquipPickerModalProps) => {
  const candidates = db.filter((item) => {
    if (item.slotId !== slotId) return false;
    if (slotId === "1" && weaponTypeId) {
      return item.weaponTypeId === weaponTypeId;
    }
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>选择装备</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {candidates.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              没有找到符合条件的装备。
            </div>
          ) : (
            candidates.map((equip) => (
              <button
                key={equip.id}
                className="w-full flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 text-left hover:border-primary/50"
                onClick={() => {
                  onSelect(equip);
                  onOpenChange(false);
                }}
              >
                <Image
                  src={`/${equip.icon}`}
                  alt={equip.name}
                  width={48}
                  height={48}
                  className="rounded-md border border-border/60"
                />
                <div className="flex-1">
                  <div className="font-medium">{equip.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {equip.mainStat.type}+{equip.mainStat.value} | 均值:{" "}
                    <span className="text-yellow-300">{getScore(equip)}</span>
                  </div>
                </div>
                <div className="text-green-400 text-lg">+</div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
