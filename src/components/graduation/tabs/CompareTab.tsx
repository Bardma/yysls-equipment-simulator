'use client';

import { EquipmentImage } from '@/components/common/EquipmentImage';
import { StatDisplay } from '@/components/common/StatDisplay';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import { calcRate, mockChengyin } from '@/lib/graduation';
import type { EquipItem, EquippedItems } from '@/lib/types';
import { cn } from '@/lib/utils';

// 计算单个词条的完整度
const getStatCompleteness = (stat: { type: string; value: number }): number => {
  const maxValue = CommonData.MAX_VALUES[stat.type] || 0;
  if (maxValue <= 0) return 0;
  return Math.min(stat.value / maxValue, 1);
};

// 计算装备总完整度
const getEquipCompleteness = (equip: EquipItem): number => {
  const allStats = [equip.mainStat, ...equip.subStats];
  if (allStats.length === 0) return 0;
  const totalCompleteness = allStats.reduce(
    (sum, stat) => sum + getStatCompleteness(stat),
    0
  );
  return (totalCompleteness / allStats.length) * 100;
};

// 根据完整度返回颜色样式
const getCompletenessColor = (completeness: number): string => {
  if (completeness >= 90) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  if (completeness >= 80) return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
  if (completeness >= 70) return 'text-sky-400 bg-sky-500/20 border-sky-500/30';
  return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
};

interface CompareTabProps {
  db: EquipItem[];
  equippedItems: EquippedItems;
  selectedSlotKey: keyof EquippedItems;
  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;
  currentRate: number;
  assumeChengyin: boolean;
  freezeDingyin: boolean;
  onAssumeChange: (value: boolean) => void;
  onFreezeChange: (value: boolean) => void;
}

export const CompareTab = ({
  db,
  equippedItems,
  selectedSlotKey,
  currentClass,
  bowType,
  setType,
  xinfaLoadout,
  earlySeasonBonus,
  currentRate,
  assumeChengyin,
  freezeDingyin,
  onAssumeChange,
  onFreezeChange,
}: CompareTabProps) => {
  // Calculate candidates
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

  let candidates = db.filter((equip) => equip.slotId === slotId);
  const currentItem = equippedItems[selectedSlotKey];

  if (slotId === '1') {
    if (currentItem) {
      candidates = candidates.filter((equip) => equip.weaponTypeId === currentItem.weaponTypeId);
    } else {
      const allowed = ClassConfig.WEAPON_RULES[currentClass] || [];
      candidates = candidates.filter((equip) => allowed.includes(equip.weaponTypeId || ''));
    }
  }

  if (currentItem) {
    candidates = candidates.filter((equip) => equip.id !== currentItem.id);
  }

  if (candidates.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={assumeChengyin} onCheckedChange={(v) => onAssumeChange(Boolean(v))} />
            假设满承音
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={freezeDingyin} onCheckedChange={(v) => onFreezeChange(Boolean(v))} />
            冻结当前定音
          </label>
        </div>
        <div className="text-muted-foreground py-10 text-center">
          库中没有符合条件的同类装备可供对比
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={assumeChengyin} onCheckedChange={(v) => onAssumeChange(Boolean(v))} />
          假设满承音
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={freezeDingyin} onCheckedChange={(v) => onFreezeChange(Boolean(v))} />
          冻结当前定音
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {candidates
          .map((equip) => {
            const testEquip = JSON.parse(JSON.stringify(equip)) as EquipItem;
            if (assumeChengyin) mockChengyin(testEquip);
            if (freezeDingyin) testEquip.dingyinStat = currentItem?.dingyinStat || null;

            const testLoadout = { ...equippedItems, [selectedSlotKey]: testEquip };
            const res = calcRate(
              testLoadout,
              currentClass,
              bowType,
              xinfaLoadout,
              setType,
              earlySeasonBonus
            );
            const newRate = parseFloat(res.graduationRate);
            const diff = newRate - currentRate;
            const completeness = getEquipCompleteness(testEquip);

            return { equip, testEquip, newRate, diff, completeness };
          })
          .sort((a, b) => a.diff - b.diff) // 按差异从小到大排序（负值更好）
          .map(({ equip, testEquip, newRate, diff, completeness }) => {
            const diffColor =
              diff > 0.0001
                ? 'text-red-400'
                : diff < -0.0001
                  ? 'text-green-400'
                  : 'text-muted-foreground';
            const diffSign = diff > 0.0001 ? '+' : '';

            return (
            <Card
              key={equip.id}
              className="relative p-3 border-slate-500/20 bg-slate-800/30"
            >
              {/* 头部：图标、名称、毕业率差异 */}
              <div className="flex items-start gap-3">
                <EquipmentImage src={testEquip.icon} name={testEquip.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 truncate">
                    {testEquip.name}
                    {assumeChengyin ? ' (拟)' : ''}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">
                      {testEquip.slotName} {testEquip.isChengyin ? '(承音)' : ''}
                    </span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium border',
                        getCompletenessColor(completeness)
                      )}
                    >
                      {completeness.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    毕业率: {newRate.toFixed(2)}%
                  </div>
                </div>
                <div className={cn('text-sm font-semibold whitespace-nowrap', diffColor)}>
                  {diffSign}
                  {diff.toFixed(2)}%
                </div>
              </div>

              {/* 词条展示 */}
              <div className="mt-2 text-xs">
                {/* 主词条 */}
                <StatDisplay
                  type={testEquip.mainStat.type}
                  value={testEquip.mainStat.value}
                  isPercent={testEquip.mainStat.isPercent}
                />
                <Separator className="my-1.5 bg-slate-600/40" />
                {/* 副词条 */}
                <div className="space-y-1">
                  {testEquip.subStats.map((sub, idx) => (
                    <StatDisplay
                      key={`${testEquip.id}-sub-${idx}`}
                      type={sub.type}
                      value={sub.value}
                      isPercent={sub.isPercent}
                    />
                  ))}
                </div>
                {/* 定音词条 */}
                {testEquip.dingyinStat && testEquip.dingyinStat.type !== '无' && (
                  <>
                    <Separator className="my-1.5 bg-cyan-600/40" />
                    <StatDisplay
                      type={testEquip.dingyinStat.type}
                      value={testEquip.dingyinStat.value}
                      isPercent={testEquip.dingyinStat.isPercent}
                    />
                  </>
                )}
              </div>
            </Card>
            );
          })}
      </div>
    </div>
  );
};
