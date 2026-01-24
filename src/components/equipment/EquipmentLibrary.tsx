'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { EquipItem, EquippedItems } from '@/lib/types';

import { EquipmentCard } from './EquipmentCard';
import { EquipmentFilter } from './EquipmentFilter';

interface EquipmentLibraryProps {
  db: EquipItem[];
  equippedItems: EquippedItems;
  filter: string;
  onFilterChange: (filter: string) => void;
  onAddEquip: () => void;
  onEditEquip: (equip: EquipItem) => void;
  onDeleteEquip: (id: number | string) => void;
  onEquipItem: (id: number | string) => void;
}

export const EquipmentLibrary = ({
  db,
  equippedItems,
  filter,
  onFilterChange,
  onAddEquip,
  onEditEquip,
  onDeleteEquip,
  onEquipItem,
}: EquipmentLibraryProps) => {
  const filteredDb = db.filter((item) => (filter === 'all' ? true : item.slotId === filter));

  return (
    <section className="space-y-4">
      <Card className="p-4 border-slate-500/20 bg-linear-to-br from-slate-500/5 via-transparent to-slate-600/5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-500/20 text-slate-300 text-xs">
              📦
            </span>
            装备库
          </h3>
          <Button
            size="sm"
            className="cursor-pointer bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-md shadow-slate-900/20"
            onClick={onAddEquip}
          >
            + 录入装备
          </Button>
        </div>
        <div className="mt-4">
          <EquipmentFilter filter={filter} onFilterChange={onFilterChange} />
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredDb.length === 0 ? (
          <Card className="col-span-full p-8 text-center border-slate-500/20 bg-slate-500/5">
            <div className="text-slate-400">
              {db.length === 0
                ? '当前数据库无装备，请点击上方录入装备按钮。'
                : '当前筛选条件下无装备。'}
            </div>
          </Card>
        ) : (
          filteredDb.map((equip) => {
            const isEquipped = Object.values(equippedItems).some(
              (item) => item && item.id === equip.id
            );
            return (
              <EquipmentCard
                key={equip.id}
                equip={equip}
                isEquipped={isEquipped}
                onClick={() => onEquipItem(equip.id)}
                onEdit={() => onEditEquip(equip)}
                onDelete={() => onDeleteEquip(equip.id)}
              />
            );
          })
        )}
      </div>
    </section>
  );
};
