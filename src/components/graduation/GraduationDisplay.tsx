'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { calculateTotalGraduation, calculateExpectedDPS } from '@/lib/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AnalysisModal } from '@/components/modals/AnalysisModal';

export function GraduationDisplay() {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { currentCharacterId } = useCharacterStore();
  const { getEquipmentsByCharacter } = useEquipmentStore();
  const { getConfig, setFreezeDingyin, setAssumeFullChengyin } = useSimulationStore();

  if (!currentCharacterId) return null;

  const config = getConfig(currentCharacterId);
  const equipments = getEquipmentsByCharacter(currentCharacterId);

  const graduation = calculateTotalGraduation(
    equipments,
    config.equippedIds,
    config.assumeFullChengyin
  );

  // 将心法槽位转换为数组
  const xinfaList = [
    config.xinfaLoadout.slot1,
    config.xinfaLoadout.slot2,
    config.xinfaLoadout.slot3,
    config.xinfaLoadout.slot4,
  ].filter(Boolean);

  const dps = calculateExpectedDPS(
    equipments,
    config.equippedIds,
    config.className,
    'precision', // 默认弓诀类型
    config.setName
  );

  // 获取Excel表格对应等级
  const getExcelGrade = (rate: number): string => {
    if (rate >= 95) return 'SSS';
    if (rate >= 90) return 'SS';
    if (rate >= 85) return 'S';
    if (rate >= 80) return 'A';
    if (rate >= 70) return 'B';
    if (rate >= 60) return 'C';
    if (rate >= 50) return 'D';
    return 'E';
  };

  const getGraduationColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-yellow-500';
    if (rate >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">毕业率统计</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAnalysis(true)}>
              详细分析
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 毕业率显示 */}
          <div className="flex items-center justify-center gap-8 py-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">当前毕业率</div>
              <div className={`text-4xl font-bold ${getGraduationColor(graduation)}`}>
                {graduation.toFixed(2)}%
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Excel表格显示</div>
              <div className="text-4xl font-bold text-primary">
                {graduation > 0 ? getExcelGrade(graduation) : '--'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">轴期望秒伤</div>
              <div className="text-2xl font-bold text-primary">
                {dps.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 选项 */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Checkbox
                id="freezeDingyin"
                checked={config.freezeDingyin}
                onCheckedChange={(c) => setFreezeDingyin(currentCharacterId, !!c)}
              />
              <Label htmlFor="freezeDingyin" className="text-sm">冻结当前定音</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fullChengyin"
                checked={config.assumeFullChengyin}
                onCheckedChange={(c) => setAssumeFullChengyin(currentCharacterId, !!c)}
              />
              <Label htmlFor="fullChengyin" className="text-sm">假设满承音</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnalysisModal
        open={showAnalysis}
        onOpenChange={setShowAnalysis}
      />
    </>
  );
}
