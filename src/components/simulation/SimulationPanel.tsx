'use client';

import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { SimulationSlot } from '@/types';
import { SIMULATION_SLOTS, SLOT_MAPPING, CLASS_LIST, SET_LIST, XINFA_LIST_ALL } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function SimulationPanel() {
  const { currentCharacterId } = useCharacterStore();
  const { getEquipmentsByCharacter, getEquipmentById } = useEquipmentStore();
  const {
    getConfig,
    setClassName,
    setSetName,
    setXinfaSlot,
    setEquippedId,
    setUseEarlySeason,
    clearSlot,
    getRecommendedXinfa,
  } = useSimulationStore();

  if (!currentCharacterId) return null;

  const config = getConfig(currentCharacterId);
  const equipments = getEquipmentsByCharacter(currentCharacterId);

  // 获取推荐的心法列表
  const recommendedXinfa = getRecommendedXinfa(config.className);

  const getSlotEquipments = (slot: SimulationSlot) => {
    const equipmentSlot = SLOT_MAPPING[slot];
    return equipments.filter(eq => eq.slot === equipmentSlot);
  };

  const getEquippedEquipment = (slot: SimulationSlot) => {
    const equipmentId = config.equippedIds[slot];
    if (!equipmentId) return null;
    return getEquipmentById(equipmentId);
  };

  // 检查心法是否被锁定
  const isXinfaLocked = (slotIndex: 1 | 2 | 3 | 4) => {
    return slotIndex <= recommendedXinfa.locked.length;
  };

  // 获取心法槽位的值
  const getXinfaSlotValue = (slotIndex: 1 | 2 | 3 | 4) => {
    const key = `slot${slotIndex}` as keyof typeof config.xinfaLoadout;
    return config.xinfaLoadout[key] || '';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">穿戴模拟</CardTitle>
          <Select value={config.className} onValueChange={(v) => setClassName(currentCharacterId, v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLASS_LIST.map((x: { value: string; label: string }) => (
                <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 装备槽位网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SIMULATION_SLOTS.map((slot) => {
            const equipped = getEquippedEquipment(slot);
            const available = getSlotEquipments(slot);

            return (
              <div key={slot} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{slot}</Label>
                <Select
                  value={config.equippedIds[slot] || '__empty__'}
                  onValueChange={(v) => {
                    if (v === '__clear__' || v === '__empty__') {
                      clearSlot(currentCharacterId, slot);
                    } else {
                      setEquippedId(currentCharacterId, slot, v);
                    }
                  }}
                >
                  <SelectTrigger className="h-auto min-h-[60px] p-2">
                    {equipped ? (
                      <div className="text-left">
                        <div className="text-sm font-medium truncate">
                          {equipped.name || equipped.slot}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {equipped.isChengyin && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">承</Badge>
                          )}
                          {equipped.isPurple && (
                            <Badge className="text-xs px-1 py-0 bg-purple-600">紫</Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">未装备</span>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__clear__">
                      <span className="text-muted-foreground">清除装备</span>
                    </SelectItem>
                    {available.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        <div className="flex items-center gap-2">
                          <span>{eq.name || eq.slot}</span>
                          {eq.isChengyin && <Badge variant="secondary" className="text-xs">承</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                    {available.length === 0 && (
                      <SelectItem value="__no_available__" disabled>
                        无可用装备
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        {/* 套装和心法选择 */}
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm">套装:</Label>
            <Select value={config.setName} onValueChange={(v) => setSetName(currentCharacterId, v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SET_LIST.map((s: { value: string; label: string }) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 心法槽位选择 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">心法配置 (4槽)</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {([1, 2, 3, 4] as const).map((slotIndex) => {
              const locked = isXinfaLocked(slotIndex);
              const currentValue = getXinfaSlotValue(slotIndex);
              
              return (
                <div key={slotIndex} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    槽位 {slotIndex} {locked && <span className="text-yellow-500">(锁定)</span>}
                  </Label>
                  <Select
                    value={currentValue}
                    onValueChange={(v) => setXinfaSlot(currentCharacterId, slotIndex, v)}
                    disabled={locked}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择心法" />
                    </SelectTrigger>
                    <SelectContent>
                      {XINFA_LIST_ALL.map((x: { value: string; label: string }) => (
                        <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>

        {/* 选项 */}
        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="earlySeason"
            checked={config.useEarlySeason}
            onCheckedChange={(c) => setUseEarlySeason(currentCharacterId, !!c)}
          />
          <Label htmlFor="earlySeason" className="text-sm">
            提前获得下半赛季属性（毕业率将虚高）
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
