'use client';

import { useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

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
import { Button } from '../ui/button';
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
      key.includes('L') ||
      key.includes(' Effectiveness') ||
      key.includes('JiaCheng') ||
      key.includes(' Damage Bonus') ||
      key.includes(' Penetration');
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
  // EquipmentXiangQingMianBan：RuGuoMoRenXuanZhongDeEquipmentCunZai，ZeZiDongZhanKai
  const [detailPanelOpen, setDetailPanelOpen] = useState(() => !!equippedItems.weapon1);

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
  const accParams = { ...accTotals, Set: setType, Inner Way: xinfaLoadout, DangQianLiuPai: currentClass };
  const accResult = rotation.length
    ? Calculator.calculateGraduationRate(accParams, skillDb, rotation, baseline, false)
    : { graduationRate: '0.00%', totalDamage: 0 };
  const currentRate = parseFloat(accResult.graduationRate);

  // Excel display rate
  const displayTotals = formatDisplayTotals(accTotals);
  const excelParams = {
    ...displayTotals,
    Set: setType,
    Inner Way: xinfaLoadout,
    DangQianLiuPai: currentClass,
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
      <DialogContent className={`!flex !flex-col gap-0 p-0 transition-all duration-300 max-h-[95vh] sm:max-h-[90vh] ${detailPanelOpen ? 'sm:max-w-7xl' : 'sm:max-w-6xl'}`}>
        <DialogHeader className="shrink-0 border-b border-border/40 px-4 sm:px-6 py-4">
          <DialogTitle className="text-base sm:text-lg">Graduation Rate Analysis</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row gap-3 lg:gap-4">
          {/* KeShenSuoDeEquipmentXiangQingMianBan - YiDongDuanYinCang */}
          <div className={`hidden lg:block relative transition-all duration-300 ${detailPanelOpen ? 'w-56' : 'w-0'} overflow-hidden shrink-0`}>
            {detailPanelOpen && equippedItems[selectedSlotKey] && (
              <div className="border-border/60 bg-card rounded-lg border p-3 space-y-2 w-56">
                <div className="text-xs font-medium text-center border-b border-border/40 pb-2">
                  {equippedItems[selectedSlotKey]?.name || 'EquipmentXiangQing'}
                </div>
                {/* Primary Affix */}
                {equippedItems[selectedSlotKey]?.mainStat && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Primary Affix</div>
                    <div className="text-xs flex justify-between">
                      <span>{equippedItems[selectedSlotKey]?.mainStat.type}</span>
                      <span className="text-yellow-300">
                        {equippedItems[selectedSlotKey]?.mainStat.value}
                        {equippedItems[selectedSlotKey]?.mainStat.isPercent ? '%' : ''}
                      </span>
                    </div>
                  </div>
                )}
                {/* Secondary Affix */}
                {equippedItems[selectedSlotKey]?.subStats && equippedItems[selectedSlotKey]!.subStats.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Secondary Affix</div>
                    {equippedItems[selectedSlotKey]?.subStats.map((sub, idx) => (
                      <div key={idx} className="text-xs flex justify-between">
                        <span>{sub.type}</span>
                        <span className="text-yellow-300">
                          {sub.value}
                          {sub.isPercent ? '%' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Dingyin Affix */}
                {equippedItems[selectedSlotKey]?.dingyinStat && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Dingyin Affix</div>
                    <div className="text-xs flex justify-between">
                      <span>{equippedItems[selectedSlotKey]?.dingyinStat?.type}</span>
                      <span className="text-yellow-300">
                        {equippedItems[selectedSlotKey]?.dingyinStat?.value}
                        {equippedItems[selectedSlotKey]?.dingyinStat?.isPercent ? '%' : ''}
                      </span>
                    </div>
                  </div>
                )}
                {/* BiaoQian */}
                <div className="flex gap-2 pt-1 flex-wrap">
                  {equippedItems[selectedSlotKey]?.isConvertible && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">KeZhuanL</span>
                  )}
                  {equippedItems[selectedSlotKey]?.isChengyin && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">ChengYin</span>
                  )}
                  {equippedItems[selectedSlotKey]?.isPurple && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">ZiZhuang</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Left sidebar - Slot selector */}
          <div className="w-full lg:w-[260px] shrink-0 space-y-2 lg:space-y-3 overflow-y-auto">
            <div className="border-border/60 bg-card rounded-lg border p-2 lg:p-3 text-center">
              <div className="text-muted-foreground text-[10px] lg:text-xs">DangQianGraduation Rate</div>
              <div className="text-lg lg:text-xl font-semibold text-yellow-300">
                {accResult.graduationRate}
              </div>
              <div className="text-muted-foreground text-[10px] lg:text-xs">
                excelBiaoGeXianShi：{excelResult.graduationRate}
              </div>
            </div>
            <EquipSlotSelector
              equippedItems={equippedItems}
              selectedSlot={selectedSlotKey}
              onSlotSelect={(slot) => {
                handleSlotSelect(slot);
                // XuanZeEquipmentShiZiDongZhanKaiXiangQingMianBan
                if (equippedItems[slot]) {
                  setDetailPanelOpen(true);
                }
              }}
            />
            {/* ZhanKai/ShouQiXiangQingMianBanAnNiu */}
            {equippedItems[selectedSlotKey] && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setDetailPanelOpen(!detailPanelOpen)}
              >
                {detailPanelOpen ? (
                  <>
                    <ChevronLeft className="h-3 w-3 mr-1 hidden lg:inline" />
                    <span className="lg:hidden">ShouQiXiangQing</span>
                    <span className="hidden lg:inline">ShouQiEquipmentXiangQing</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1 hidden lg:inline" />
                    <span className="lg:hidden">ChaKanXiangQing</span>
                    <span className="hidden lg:inline">ChaKanEquipmentXiangQing</span>
                  </>
                )}
              </Button>
            )}

            {/* YiDongDuanEquipmentXiangQingMianBan */}
            {detailPanelOpen && equippedItems[selectedSlotKey] && (
              <div className="lg:hidden border-border/60 bg-card rounded-lg border p-2 space-y-1.5">
                <div className="text-[10px] font-medium text-center border-b border-border/40 pb-1.5">
                  {equippedItems[selectedSlotKey]?.name || 'EquipmentXiangQing'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {/* ZuoLie：Primary Affix + Dingyin */}
                  <div className="space-y-1">
                    {equippedItems[selectedSlotKey]?.mainStat && (
                      <div>
                        <div className="text-muted-foreground">Primary Affix</div>
                        <div className="flex justify-between">
                          <span className="truncate">{equippedItems[selectedSlotKey]?.mainStat.type}</span>
                          <span className="text-yellow-300 shrink-0 ml-1">
                            {equippedItems[selectedSlotKey]?.mainStat.value}
                            {equippedItems[selectedSlotKey]?.mainStat.isPercent ? '%' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                    {equippedItems[selectedSlotKey]?.dingyinStat && (
                      <div>
                        <div className="text-muted-foreground">Dingyin</div>
                        <div className="flex justify-between">
                          <span className="truncate">{equippedItems[selectedSlotKey]?.dingyinStat?.type}</span>
                          <span className="text-yellow-300 shrink-0 ml-1">
                            {equippedItems[selectedSlotKey]?.dingyinStat?.value}
                            {equippedItems[selectedSlotKey]?.dingyinStat?.isPercent ? '%' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* YouLie：Secondary Affix */}
                  <div className="space-y-0.5">
                    <div className="text-muted-foreground">Secondary Affix</div>
                    {equippedItems[selectedSlotKey]?.subStats.map((sub, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate">{sub.type}</span>
                        <span className="text-yellow-300 shrink-0 ml-1">
                          {sub.value}{sub.isPercent ? '%' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* BiaoQian */}
                <div className="flex gap-1.5 pt-1 flex-wrap justify-center">
                  {equippedItems[selectedSlotKey]?.isConvertible && (
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded">KeZhuanL</span>
                  )}
                  {equippedItems[selectedSlotKey]?.isChengyin && (
                    <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1 py-0.5 rounded">ChengYin</span>
                  )}
                  {equippedItems[selectedSlotKey]?.isPurple && (
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded">ZiZhuang</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right content - Tabs */}
          <div className="flex-1 min-w-0 flex flex-col">
            <Tabs defaultValue="compare" className="w-full flex flex-col flex-1">
              {/* YiDongDuanKeGunDongDe Tab RongQi */}
              <div className="shrink-0 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-none">
                <TabsList className="w-max sm:w-full justify-start">
                  <TabsTrigger value="compare" className="text-[11px] sm:text-xs lg:text-sm px-2 sm:px-3">DuiBi</TabsTrigger>
                  <TabsTrigger value="convert" className="text-[11px] sm:text-xs lg:text-sm px-2 sm:px-3">ZhuanL</TabsTrigger>
                  <TabsTrigger value="best-build" className="text-[11px] sm:text-xs lg:text-sm px-2 sm:px-3">PeiZhuang</TabsTrigger>
                  <TabsTrigger value="stat-priority" className="text-[11px] sm:text-xs lg:text-sm px-2 sm:px-3">Affix</TabsTrigger>
                  <TabsTrigger value="cultivation" className="text-[11px] sm:text-xs lg:text-sm px-2 sm:px-3">PeiYang</TabsTrigger>
                </TabsList>
              </div>

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

              <TabsContent value="convert" className="pt-4 flex-1 overflow-auto">
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
