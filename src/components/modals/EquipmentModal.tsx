'use client';

import { useState, useEffect } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { Equipment, EquipmentSlot, WeaponType, Affix, AffixType } from '@/types';
import { EQUIPMENT_SLOTS, WEAPON_TYPES, AFFIX_TYPES } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { OCRModal } from './OCRModal';

interface EquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId?: string;
}

const emptyAffix: Affix = { type: '', value: 0, isPercent: false };

export function EquipmentModal({ open, onOpenChange, equipmentId }: EquipmentModalProps) {
  const { currentCharacterId } = useCharacterStore();
  const { addEquipment, updateEquipment, getEquipmentById } = useEquipmentStore();

  const [showOCR, setShowOCR] = useState(false);
  const [slot, setSlot] = useState<EquipmentSlot | ''>('');
  const [weaponType, setWeaponType] = useState<WeaponType | ''>('');
  const [name, setName] = useState('');
  const [isChengyin, setIsChengyin] = useState(false);
  const [isPurple, setIsPurple] = useState(false);
  const [canTransfer, setCanTransfer] = useState(false);
  const [mainAffix, setMainAffix] = useState<Affix>({ ...emptyAffix });
  const [subAffixes, setSubAffixes] = useState<Affix[]>([
    { ...emptyAffix },
    { ...emptyAffix },
    { ...emptyAffix },
    { ...emptyAffix },
  ]);
  const [dingyin, setDingyin] = useState<Affix>({ ...emptyAffix });

  // 加载编辑数据
  useEffect(() => {
    if (equipmentId) {
      const equipment = getEquipmentById(equipmentId);
      if (equipment) {
        setSlot(equipment.slot);
        setWeaponType(equipment.weaponType || '');
        setName(equipment.name);
        setIsChengyin(equipment.isChengyin);
        setIsPurple(equipment.isPurple);
        setCanTransfer(equipment.canTransfer);
        setMainAffix(equipment.mainAffix);
        setSubAffixes(equipment.subAffixes.length === 4
          ? equipment.subAffixes
          : [...equipment.subAffixes, ...Array(4 - equipment.subAffixes.length).fill({ ...emptyAffix })]
        );
        setDingyin(equipment.dingyin);
      }
    } else {
      resetForm();
    }
  }, [equipmentId, open]);

  const resetForm = () => {
    setSlot('');
    setWeaponType('');
    setName('');
    setIsChengyin(false);
    setIsPurple(false);
    setCanTransfer(false);
    setMainAffix({ ...emptyAffix });
    setSubAffixes([
      { ...emptyAffix },
      { ...emptyAffix },
      { ...emptyAffix },
      { ...emptyAffix },
    ]);
    setDingyin({ ...emptyAffix });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCharacterId || !slot) return;

    const equipmentData = {
      characterId: currentCharacterId,
      slot: slot as EquipmentSlot,
      weaponType: slot === '武器' ? (weaponType as WeaponType) : undefined,
      name,
      isChengyin,
      isPurple,
      canTransfer,
      mainAffix,
      subAffixes,
      dingyin,
    };

    if (equipmentId) {
      updateEquipment(equipmentId, equipmentData);
    } else {
      addEquipment(equipmentData);
    }

    onOpenChange(false);
    resetForm();
  };

  const handleOCRResult = (data: Partial<Equipment>) => {
    if (data.slot) setSlot(data.slot);
    if (data.weaponType) setWeaponType(data.weaponType);
    if (data.name) setName(data.name);
    if (data.mainAffix) setMainAffix(data.mainAffix);
    if (data.subAffixes) setSubAffixes(data.subAffixes);
    if (data.dingyin) setDingyin(data.dingyin);
    setShowOCR(false);
  };

  const updateSubAffix = (index: number, field: keyof Affix, value: any) => {
    setSubAffixes((prev) => {
      const newAffixes = [...prev];
      newAffixes[index] = { ...newAffixes[index], [field]: value };
      return newAffixes;
    });
  };

  const handleAffixTypeChange = (
    setter: React.Dispatch<React.SetStateAction<Affix>>,
    type: string
  ) => {
    const isPercent = type.includes('百分比');
    setter((prev) => ({ ...prev, type: type as AffixType, isPercent }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{equipmentId ? '编辑装备' : '录入装备'}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>装备位置</Label>
                  <Select value={slot} onValueChange={(v) => setSlot(v as EquipmentSlot)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择位置" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_SLOTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {slot === '武器' && (
                  <div className="space-y-2">
                    <Label>武器种类</Label>
                    <Select value={weaponType} onValueChange={(v) => setWeaponType(v as WeaponType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择种类" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEAPON_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* 装备属性 */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="chengyin"
                    checked={isChengyin}
                    onCheckedChange={(c) => setIsChengyin(!!c)}
                  />
                  <Label htmlFor="chengyin">承音</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="purple"
                    checked={isPurple}
                    onCheckedChange={(c) => setIsPurple(!!c)}
                  />
                  <Label htmlFor="purple">紫装</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="transfer"
                    checked={canTransfer}
                    onCheckedChange={(c) => setCanTransfer(!!c)}
                  />
                  <Label htmlFor="transfer">可转律</Label>
                </div>
              </div>

              {/* 装备名称 */}
              <div className="space-y-2">
                <Label>装备名称</Label>
                <Input
                  placeholder="输入名称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <Separator />

              {/* 主词条 */}
              <div className="space-y-2">
                <h4 className="font-medium">主词条</h4>
                <AffixInput
                  affix={mainAffix}
                  onTypeChange={(t) => handleAffixTypeChange(setMainAffix, t)}
                  onValueChange={(v) => setMainAffix((prev) => ({ ...prev, value: v }))}
                />
              </div>

              <Separator />

              {/* 副词条 */}
              <div className="space-y-2">
                <h4 className="font-medium">副词条 (4条)</h4>
                <div className="grid gap-2">
                  {subAffixes.map((affix, index) => (
                    <AffixInput
                      key={index}
                      affix={affix}
                      onTypeChange={(t) => {
                        const isPercent = t.includes('百分比');
                        updateSubAffix(index, 'type', t);
                        updateSubAffix(index, 'isPercent', isPercent);
                      }}
                      onValueChange={(v) => updateSubAffix(index, 'value', v)}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* 定音词条 */}
              <div className="space-y-2">
                <h4 className="font-medium">定音词条</h4>
                <AffixInput
                  affix={dingyin}
                  onTypeChange={(t) => handleAffixTypeChange(setDingyin, t)}
                  onValueChange={(v) => setDingyin((prev) => ({ ...prev, value: v }))}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowOCR(true)}>
                📷 文字识别
              </Button>
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={!slot}>
                保存装备
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <OCRModal
        open={showOCR}
        onOpenChange={setShowOCR}
        onResult={handleOCRResult}
      />
    </>
  );
}

// 词条输入组件
interface AffixInputProps {
  affix: Affix;
  onTypeChange: (type: string) => void;
  onValueChange: (value: number) => void;
}

function AffixInput({ affix, onTypeChange, onValueChange }: AffixInputProps) {
  return (
    <div className="flex gap-2 items-center">
      <Select value={affix.type || ''} onValueChange={onTypeChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="选择词条" />
        </SelectTrigger>
        <SelectContent>
          {AFFIX_TYPES.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          className="w-24"
          placeholder="数值"
          value={affix.value || ''}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
        />
        {affix.isPercent && <span className="text-muted-foreground">%</span>}
      </div>
    </div>
  );
}
