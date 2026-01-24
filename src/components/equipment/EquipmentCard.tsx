'use client';

import { Equipment } from '@/types';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { useCharacterStore } from '@/stores/characterStore';
import { calculateEquipmentGraduation } from '@/lib/calculator';
import { SIMULATION_SLOTS, SLOT_MAPPING } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: () => void;
}

export function EquipmentCard({ equipment, onEdit }: EquipmentCardProps) {
  const { deleteEquipment } = useEquipmentStore();
  const { setEquippedId, getConfig } = useSimulationStore();
  const { currentCharacterId } = useCharacterStore();

  const graduation = calculateEquipmentGraduation(equipment);
  const config = currentCharacterId ? getConfig(currentCharacterId) : null;

  // 检查这件装备是否已被装备
  const equippedSlot = config
    ? Object.entries(config.equippedIds).find(([_, id]) => id === equipment.id)?.[0]
    : null;

  // 获取可以装备到的槽位
  const availableSlots = SIMULATION_SLOTS.filter(
    slot => SLOT_MAPPING[slot] === equipment.slot
  );

  const handleEquip = (slot: string) => {
    if (currentCharacterId) {
      setEquippedId(currentCharacterId, slot as any, equipment.id);
    }
  };

  const handleDelete = () => {
    if (confirm('确定要删除这件装备吗？')) {
      deleteEquipment(equipment.id);
    }
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">
                {equipment.name || `${equipment.slot}装备`}
              </span>
              <Badge variant="outline" className="text-xs">
                {equipment.slot}
                {equipment.weaponType && ` - ${equipment.weaponType}`}
              </Badge>
              {equipment.isChengyin && (
                <Badge variant="secondary" className="text-xs">承音</Badge>
              )}
              {equipment.isPurple && (
                <Badge className="text-xs bg-purple-600">紫装</Badge>
              )}
              {equipment.canTransfer && (
                <Badge variant="outline" className="text-xs">可转律</Badge>
              )}
              {equippedSlot && (
                <Badge className="text-xs bg-green-600">已装备: {equippedSlot}</Badge>
              )}
            </div>

            {/* 词条显示 */}
            <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
              {equipment.mainAffix.type && (
                <div>
                  <span className="text-primary">主:</span> {equipment.mainAffix.type} +{equipment.mainAffix.value}
                  {equipment.mainAffix.isPercent && '%'}
                </div>
              )}
              <div className="flex flex-wrap gap-x-3">
                {equipment.subAffixes.filter(a => a.type).map((affix, idx) => (
                  <span key={idx}>
                    {affix.type} +{affix.value}{affix.isPercent && '%'}
                  </span>
                ))}
              </div>
              {equipment.dingyin.type && (
                <div>
                  <span className="text-yellow-500">定音:</span> {equipment.dingyin.type} +{equipment.dingyin.value}
                  {equipment.dingyin.isPercent && '%'}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`text-sm font-medium ${
              graduation >= 80 ? 'text-green-500' :
              graduation >= 60 ? 'text-yellow-500' :
              'text-muted-foreground'
            }`}>
              {graduation.toFixed(1)}%
            </span>

            <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    装备
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availableSlots.map((slot) => (
                    <DropdownMenuItem key={slot} onClick={() => handleEquip(slot)}>
                      装备到 {slot}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onEdit}
              >
                编辑
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
