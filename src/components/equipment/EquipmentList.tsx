'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { EquipmentSlot } from '@/types';
import { EQUIPMENT_SLOTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EquipmentCard } from './EquipmentCard';
import { EquipmentModal } from '@/components/modals/EquipmentModal';

export function EquipmentList() {
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot | '全部'>('全部');
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | undefined>();

  const { currentCharacterId } = useCharacterStore();
  const { getEquipmentsByCharacter } = useEquipmentStore();

  const equipments = currentCharacterId
    ? getEquipmentsByCharacter(currentCharacterId)
    : [];

  const filteredEquipments = activeSlot === '全部'
    ? equipments
    : equipments.filter(eq => eq.slot === activeSlot);

  const handleAddEquipment = () => {
    setEditingEquipmentId(undefined);
    setShowEquipmentModal(true);
  };

  const handleEditEquipment = (id: string) => {
    setEditingEquipmentId(id);
    setShowEquipmentModal(true);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">装备列表</CardTitle>
          <Button size="sm" onClick={handleAddEquipment}>
            + 录入装备
          </Button>
        </div>

        {/* 槽位筛选 */}
        <div className="flex flex-wrap gap-1 mt-3">
          <Button
            variant={activeSlot === '全部' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSlot('全部')}
          >
            全部
          </Button>
          {EQUIPMENT_SLOTS.map((slot) => (
            <Button
              key={slot}
              variant={activeSlot === slot ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSlot(slot)}
            >
              {slot}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          {filteredEquipments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>当前数据库无装备</p>
              <p className="text-sm mt-2">
                请点击右上角 <strong>录入装备</strong> 按钮进行装备录入
              </p>
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {filteredEquipments.map((equipment) => (
                <EquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                  onEdit={() => handleEditEquipment(equipment.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <EquipmentModal
        open={showEquipmentModal}
        onOpenChange={setShowEquipmentModal}
        equipmentId={editingEquipmentId}
      />
    </Card>
  );
}
