'use client';

import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

export function CharacterSelector() {
  const { characters, currentCharacterId, setCurrentCharacter, deleteCharacter } = useCharacterStore();
  const { deleteEquipmentsByCharacter } = useEquipmentStore();
  const { deleteConfig } = useSimulationStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (currentCharacterId) {
      // 删除角色相关的所有数据
      deleteEquipmentsByCharacter(currentCharacterId);
      deleteConfig(currentCharacterId);
      deleteCharacter(currentCharacterId);
      setShowDeleteConfirm(false);
    }
  };

  const currentCharacter = characters.find(c => c.id === currentCharacterId);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">当前角色：</span>

      <Select
        value={currentCharacterId || '__none__'}
        onValueChange={(value) => setCurrentCharacter(value === '__none__' ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="-- 请选择/添加角色 --" />
        </SelectTrigger>
        <SelectContent>
          {characters.length === 0 ? (
            <SelectItem value="__none__" disabled>
              -- 请选择/添加角色 --
            </SelectItem>
          ) : (
            characters.map((char) => (
              <SelectItem key={char.id} value={char.id}>
                {char.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Button
        variant="destructive"
        size="sm"
        disabled={!currentCharacterId}
        onClick={() => setShowDeleteConfirm(true)}
      >
        删除
      </Button>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除角色 "{currentCharacter?.name}" 吗？该角色的所有装备数据也将被删除，此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
