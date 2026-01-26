'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useJiebaSearch } from '@/lib/hooks';
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
  const t = useTranslations('equipment');
  // 使用 jieba 分词搜索
  const { searchQuery, setSearchQuery, filteredItems: searchedItems } = useJiebaSearch(db);

  // 先按部位筛选，再按搜索关键词过滤
  const filteredDb = searchedItems.filter((item) =>
    filter === 'all' ? true : item.slotId === filter
  );

  return (
    <section className="space-y-3 sm:space-y-4">
      <Card className="p-3 sm:p-4 border-slate-500/20 bg-linear-to-br from-slate-500/5 via-transparent to-slate-600/5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
            <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-500/20 text-slate-300 text-xs">
              📦
            </span>
            {t('library')}
          </h3>
          <Button
            size="sm"
            className="cursor-pointer bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-md shadow-slate-900/20 text-xs sm:text-sm"
            onClick={onAddEquip}
          >
            {t('addEquipment')}
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="mt-3 sm:mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-600/50 placeholder:text-slate-500 focus:border-slate-500 text-sm"
          />
        </div>

        <div className="mt-3 sm:mt-4">
          <EquipmentFilter filter={filter} onFilterChange={onFilterChange} />
        </div>
      </Card>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDb.length === 0 ? (
          <Card className="col-span-full p-8 text-center border-slate-500/20 bg-slate-500/5">
            <div className="text-slate-400">
              {db.length === 0
                ? t('emptyLibrary')
                : searchQuery
                  ? t('noSearchResults')
                  : t('noFilterResults')}
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
