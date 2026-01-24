'use client';

import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { SimulationSlot } from '@/types';
import { SIMULATION_SLOTS, XINFA_LIST, GONGJUE_LIST, NEIGONG_LIST, SLOT_MAPPING } from '@/lib/constants';
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
import { Button } from '@/components/ui/button';

export function SimulationPanel() {
  const { currentCharacterId } = useCharacterStore();
  const { getEquipmentsByCharacter, getEquipmentById } = useEquipmentStore();
  const {
    getConfig,
    setXinfa,
    setGongJue,
    setNeiGong,
    setEquippedId,
    setUseNextSeason,
    clearSlot,
  } = useSimulationStore();

  if (!currentCharacterId) return null;

  const config = getConfig(currentCharacterId);
  const equipments = getEquipmentsByCharacter(currentCharacterId);

  const getSlotEquipments = (slot: SimulationSlot) => {
    const equipmentSlot = SLOT_MAPPING[slot];
    return equipments.filter(eq => eq.slot === equipmentSlot);
  };

  const getEquippedEquipment = (slot: SimulationSlot) => {
    const equipmentId = config.equippedIds[slot];
    if (!equipmentId) return null;
    return getEquipmentById(equipmentId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">穿戴模拟</CardTitle>
          <Select value={config.xinfa} onValueChange={(v) => setXinfa(currentCharacterId, v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {XINFA_LIST.map((x) => (
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

        {/* 弓诀和内功选择 */}
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm">弓诀:</Label>
            <Select value={config.gongJue} onValueChange={(v) => setGongJue(currentCharacterId, v)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GONGJUE_LIST.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm">内功:</Label>
            <Select value={config.neiGong} onValueChange={(v) => setNeiGong(currentCharacterId, v)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEIGONG_LIST.map((n) => (
                  <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 选项 */}
        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="nextSeason"
            checked={config.useNextSeason}
            onCheckedChange={(c) => setUseNextSeason(currentCharacterId, !!c)}
          />
          <Label htmlFor="nextSeason" className="text-sm">
            提前获得下半赛季属性（毕业率将虚高）
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
