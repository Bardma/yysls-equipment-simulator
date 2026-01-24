'use client';

import { useMemo } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import {
  calculateTotalGraduation,
  calculateEquipmentGraduation,
  analyzeAffixPriority,
  getCultivationAdvice
} from '@/lib/calculator';
import { SIMULATION_SLOTS } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalysisModal({ open, onOpenChange }: AnalysisModalProps) {
  const { currentCharacterId } = useCharacterStore();
  const { getEquipmentsByCharacter, getEquipmentById } = useEquipmentStore();
  const { getConfig } = useSimulationStore();

  const config = currentCharacterId ? getConfig(currentCharacterId) : null;
  const equipments = currentCharacterId ? getEquipmentsByCharacter(currentCharacterId) : [];

  const graduation = useMemo(() => {
    if (!config) return 0;
    return calculateTotalGraduation(equipments, config.equippedIds, config.assumeFullChengyin);
  }, [equipments, config]);

  const priorities = useMemo(() => {
    if (!config) return [];
    return analyzeAffixPriority(equipments, config.equippedIds);
  }, [equipments, config]);

  const advice = useMemo(() => {
    if (!config) return [];
    return getCultivationAdvice(equipments, config.equippedIds);
  }, [equipments, config]);

  // 分析每件装备的收益
  const equipmentAnalysis = useMemo(() => {
    if (!config) return [];

    const results: { slot: string; equipment: any; graduation: number; benefit: number }[] = [];

    SIMULATION_SLOTS.forEach((slot) => {
      const equipmentId = config.equippedIds[slot];
      if (equipmentId) {
        const equipment = getEquipmentById(equipmentId);
        if (equipment) {
          const grad = calculateEquipmentGraduation(equipment);

          // 计算如果没有这件装备的毕业率
          const configWithout = { ...config.equippedIds };
          delete configWithout[slot];
          const gradWithout = calculateTotalGraduation(equipments, configWithout, config.assumeFullChengyin);

          results.push({
            slot,
            equipment,
            graduation: grad,
            benefit: graduation - gradWithout,
          });
        }
      }
    });

    return results.sort((a, b) => b.benefit - a.benefit);
  }, [equipments, config, graduation]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>毕业率分析</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center gap-6 py-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">当前毕业率</div>
            <div className="text-3xl font-bold text-primary">{graduation.toFixed(2)}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Excel表格显示</div>
            <div className="text-3xl font-bold text-primary">{getExcelGrade(graduation)}</div>
          </div>
        </div>

        <Tabs defaultValue="priority" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="equipment">装备收益</TabsTrigger>
            <TabsTrigger value="priority">词条优先级</TabsTrigger>
            <TabsTrigger value="advice">培养方向</TabsTrigger>
            <TabsTrigger value="best">最佳配装</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[350px] mt-4">
            <TabsContent value="equipment" className="mt-0">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  在当前配装的基础上，扣除某装备会损失
                </h4>
                {equipmentAnalysis.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">请先装备一些装备</p>
                ) : (
                  equipmentAnalysis.map((item, idx) => (
                    <Card key={item.slot}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{item.slot}</Badge>
                          <span className="font-medium">{item.equipment.name || item.equipment.slot}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            单件: {item.graduation.toFixed(1)}%
                          </span>
                          <span className={`font-medium ${
                            item.benefit > 5 ? 'text-green-500' :
                            item.benefit > 2 ? 'text-yellow-500' :
                            'text-muted-foreground'
                          }`}>
                            贡献: +{item.benefit.toFixed(2)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="priority" className="mt-0">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  在当前配装的基础上，再新增的词条收益（边际收益）
                </h4>
                <div className="grid gap-2">
                  {priorities.slice(0, 10).map((item, idx) => (
                    <div
                      key={item.affix}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          idx < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-medium">{item.affix}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(item.benefit / priorities[0]?.benefit) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {item.benefit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advice" className="mt-0">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">培养建议</h4>
                {advice.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">暂无建议</p>
                ) : (
                  <div className="space-y-3">
                    {advice.map((item, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                            <p>{item}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="best" className="mt-0">
              <div className="text-center py-8 text-muted-foreground">
                <p>最佳配装功能开发中...</p>
                <p className="text-sm mt-2">该功能将自动计算最优装备搭配方案</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
