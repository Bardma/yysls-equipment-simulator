'use client';

import { useMemo, useState } from 'react';

import { Calculator } from '@/lib/calculator';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import { calcRate } from '@/lib/graduation';
import type { EquipItem, EquippedItems } from '@/lib/types';

import {
  BestBuildTab,
  CompareTab,
  ConvertTab,
  CultivationTab,
  EquipSlotSelector,
  StatPriorityTab,
} from '../graduation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EquipPickerModal } from './EquipPickerModal';

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
  onApplyBuild: (equips: EquippedItems) => void;
}

const formatDisplayTotals = (totals: Record<string, number>) => {
  const displayTotals: Record<string, number> = { ...totals };
  for (const key in displayTotals) {
    const val = Number(displayTotals[key]) || 0;
    const isPercent =
      CommonData.PERCENT_STATS.includes(key) ||
      key.includes('率') ||
      key.includes('增效') ||
      key.includes('加成') ||
      key.includes('增伤') ||
      key.includes('穿透');
    displayTotals[key] = isPercent ? parseFloat(val.toFixed(1)) : Math.round(val);
  }
  return displayTotals;
};

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
  onApplyBuild,
}: GraduationModalProps) => {
  const [selectedSlotKey, setSelectedSlotKey] = useState<keyof EquippedItems>('weapon1');
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [customTarget, setCustomTarget] = useState<EquipItem | null>(null);
  const [assumeChengyin, setAssumeChengyin] = useState(false);
  const [freezeDingyin, setFreezeDingyin] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlotId, setPickerSlotId] = useState('1');
  const [pickerWeaponType, setPickerWeaponType] = useState<string | null>(null);

  const rotationConfig = ClassConfig.ROTATIONS[currentClass];
  const rotation = rotationConfig?.rotation || [];
  const baseline = rotationConfig?.baseline || 4244078.34;
  const skillDb = rotationConfig?.skillDatabase || {};

  // Calculate current rate
  const accTotals = Calculator.calculateTotal(
    equippedItems,
    currentClass,
    bowType,
    xinfaLoadout,
    setType,
    false,
    null,
    earlySeasonBonus
  );
  const accParams = { ...accTotals, 套装: setType, 心法: xinfaLoadout, 当前流派: currentClass };
  const accResult = rotation.length
    ? Calculator.calculateGraduationRate(accParams, skillDb, rotation, baseline, false)
    : { graduationRate: '0.00%', totalDamage: 0 };
  const currentRate = parseFloat(accResult.graduationRate);

  // Excel display rate
  const displayTotals = formatDisplayTotals(accTotals);
  const excelParams = {
    ...displayTotals,
    套装: setType,
    心法: xinfaLoadout,
    当前流派: currentClass,
  };
  const excelResult = rotation.length
    ? Calculator.calculateGraduationRate(excelParams, skillDb, rotation, baseline, false)
    : { graduationRate: '0.00%', totalDamage: 0 };

  const convertTarget = customTarget || equippedItems[selectedSlotKey];

  const handlePickEquip = () => {
    const target = equippedItems[selectedSlotKey];
    const slotId =
      selectedSlotKey === 'weapon1' || selectedSlotKey === 'weapon2'
        ? '1'
        : selectedSlotKey === 'ring'
          ? '3'
          : selectedSlotKey === 'pendant'
            ? '4'
            : selectedSlotKey === 'head'
              ? '5'
              : selectedSlotKey === 'chest'
                ? '6'
                : selectedSlotKey === 'legs'
                  ? '7'
                  : '8';
    setPickerSlotId(slotId);
    setPickerWeaponType(target?.weaponTypeId || null);
    setPickerOpen(true);
  };

  const handleSlotSelect = (slot: keyof EquippedItems) => {
    setSelectedSlotKey(slot);
    setSelectedSubIndex(0);
    setCustomTarget(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>毕业率分析</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[260px_1fr] gap-4 max-h-[70vh]">
          {/* Left sidebar - Slot selector */}
          <div className="space-y-3 overflow-y-auto">
            <div className="border-border/60 bg-card rounded-lg border p-3 text-center">
              <div className="text-muted-foreground text-xs">当前毕业率</div>
              <div className="text-xl font-semibold text-yellow-300">
                {accResult.graduationRate}
              </div>
              <div className="text-muted-foreground text-xs">
                excel表格显示：{excelResult.graduationRate}
              </div>
            </div>
            <EquipSlotSelector
              equippedItems={equippedItems}
              selectedSlot={selectedSlotKey}
              onSlotSelect={handleSlotSelect}
            />
          </div>

          {/* Right content - Tabs */}
          <div className="min-w-0 flex flex-col overflow-hidden">
            <Tabs defaultValue="compare" className="w-full flex flex-col flex-1 overflow-hidden">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="compare">单件装备对比</TabsTrigger>
                <TabsTrigger value="convert">转律建议</TabsTrigger>
                <TabsTrigger value="best-build">最佳配装</TabsTrigger>
                <TabsTrigger value="stat-priority">词条优先级</TabsTrigger>
                <TabsTrigger value="cultivation">培养方向</TabsTrigger>
              </TabsList>

              <TabsContent value="compare" className="space-y-4 pt-4 flex-1 overflow-y-auto">
                <CompareTab
                  db={db}
                  equippedItems={equippedItems}
                  selectedSlotKey={selectedSlotKey}
                  currentClass={currentClass}
                  bowType={bowType}
                  setType={setType}
                  xinfaLoadout={xinfaLoadout}
                  earlySeasonBonus={earlySeasonBonus}
                  currentRate={currentRate}
                  assumeChengyin={assumeChengyin}
                  freezeDingyin={freezeDingyin}
                  onAssumeChange={setAssumeChengyin}
                  onFreezeChange={setFreezeDingyin}
                />
              </TabsContent>

              <TabsContent value="convert" className="pt-4 flex-1 overflow-y-auto">
                <ConvertTab
                  convertTarget={convertTarget}
                  selectedSubIndex={selectedSubIndex}
                  onSubIndexChange={setSelectedSubIndex}
                  equippedItems={equippedItems}
                  selectedSlotKey={selectedSlotKey}
                  currentClass={currentClass}
                  bowType={bowType}
                  setType={setType}
                  xinfaLoadout={xinfaLoadout}
                  earlySeasonBonus={earlySeasonBonus}
                  currentRate={currentRate}
                  onPickEquip={handlePickEquip}
                />
              </TabsContent>

              <TabsContent value="best-build" className="pt-4 flex-1 overflow-y-auto">
                <BestBuildTab
                  db={db}
                  currentClass={currentClass}
                  bowType={bowType}
                  setType={setType}
                  xinfaLoadout={xinfaLoadout}
                  earlySeasonBonus={earlySeasonBonus}
                  onApplyBuild={onApplyBuild}
                />
              </TabsContent>

              <TabsContent value="stat-priority" className="pt-4 flex-1 overflow-y-auto">
                <StatPriorityTab
                  equippedItems={equippedItems}
                  currentClass={currentClass}
                  bowType={bowType}
                  setType={setType}
                  xinfaLoadout={xinfaLoadout}
                  earlySeasonBonus={earlySeasonBonus}
                  currentRate={currentRate}
                />
              </TabsContent>

              <TabsContent value="cultivation" className="pt-4 flex-1 overflow-y-auto">
                <CultivationTab
                  equippedItems={equippedItems}
                  currentClass={currentClass}
                  bowType={bowType}
                  setType={setType}
                  xinfaLoadout={xinfaLoadout}
                  earlySeasonBonus={earlySeasonBonus}
                  currentRate={currentRate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <EquipPickerModal
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          slotId={pickerSlotId}
          weaponTypeId={pickerWeaponType}
          db={db}
          onSelect={(item) => {
            setCustomTarget(item);
            setSelectedSubIndex(0);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
