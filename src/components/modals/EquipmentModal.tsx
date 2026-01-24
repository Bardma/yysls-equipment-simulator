'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import { CommonData } from '../../lib/data/commonData';
import type { EquipItem } from '../../lib/types';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const emptySubStats = () => Array.from({ length: 4 }).map(() => ({ type: '', value: '' }));

interface EquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEquip?: EquipItem | null;
  onSave: (equip: EquipItem, isNew: boolean) => void;
}

export const EquipmentModal = ({
  open,
  onOpenChange,
  initialEquip,
  onSave,
}: EquipmentModalProps) => {
  const [slotId, setSlotId] = useState('1');
  const [weaponTypeId, setWeaponTypeId] = useState('');
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [isChengyin, setIsChengyin] = useState(false);
  const [isPurple, setIsPurple] = useState(false);
  const [isConvertible, setIsConvertible] = useState(false);
  const [mainStatType, setMainStatType] = useState('');
  const [mainStatValue, setMainStatValue] = useState('');
  const [dingyinType, setDingyinType] = useState('无');
  const [dingyinValue, setDingyinValue] = useState('');
  const [subStats, setSubStats] = useState<{ type: string; value: string }[]>(emptySubStats());

  useEffect(() => {
    if (!open) return;
    if (initialEquip) {
      setSlotId(initialEquip.slotId);
      setWeaponTypeId(initialEquip.weaponTypeId || '');
      setName(initialEquip.name);
      setNameEdited(true);
      setIsChengyin(Boolean(initialEquip.isChengyin));
      setIsPurple(Boolean(initialEquip.isPurple));
      setIsConvertible(Boolean(initialEquip.isConvertible));
      setMainStatType(initialEquip.mainStat.type);
      setMainStatValue(initialEquip.mainStat.value.toString());
      if (initialEquip.dingyinStat) {
        setDingyinType(initialEquip.dingyinStat.type);
        setDingyinValue(initialEquip.dingyinStat.value.toString());
      } else {
        setDingyinType('无');
        setDingyinValue('');
      }
      const nextSubStats = emptySubStats();
      initialEquip.subStats.forEach((sub, idx) => {
        if (nextSubStats[idx]) {
          nextSubStats[idx] = { type: sub.type, value: sub.value.toString() };
        }
      });
      setSubStats(nextSubStats);
      return;
    }
    setSlotId('1');
    setWeaponTypeId('');
    setName('');
    setNameEdited(false);
    setIsChengyin(false);
    setIsPurple(false);
    setIsConvertible(false);
    setMainStatType('');
    setMainStatValue('');
    setDingyinType('无');
    setDingyinValue('');
    setSubStats(emptySubStats());
  }, [open, initialEquip]);

  const slotOptions = CommonData.SLOTS;
  const weaponOptions = CommonData.WEAPON_TYPES;

  const mainStatOptions = useMemo(() => {
    return CommonData.MAIN_STAT_RULES[slotId] || [];
  }, [slotId]);

  const dingyinOptions = useMemo(() => {
    return CommonData.DINGYIN_RULES[slotId] || ['无'];
  }, [slotId]);

  const subStatOptions = useMemo(() => {
    let opts = [...CommonData.BASE_SUB_STATS];
    if (slotId === '1') {
      const weapon = CommonData.WEAPON_TYPES.find((w) => w.id === weaponTypeId);
      if (weapon) opts.push(weapon.stat);
    }
    if (['3', '4'].includes(slotId)) opts.push('全武学增效');
    if (['5', '6'].includes(slotId)) {
      opts.push('单体类奇术增伤');
      opts.push('群体类奇术增伤');
    }
    if (['7', '8'].includes(slotId)) opts.push('对首领单位增伤');
    opts.push('生存类词条');
    return Array.from(new Set(opts)).sort();
  }, [slotId, weaponTypeId]);

  const iconPath = useMemo(() => {
    const slot = CommonData.SLOTS.find((s) => s.id === slotId);
    let icon = slot?.icon || 'icon/icon1.jpg';
    if (slotId === '1') {
      const weapon = CommonData.WEAPON_TYPES.find((w) => w.id === weaponTypeId);
      if (weapon) icon = weapon.icon;
    }
    if (isPurple && icon.endsWith('.jpg')) {
      icon = icon.replace('.jpg', 'p.jpg');
    }
    return `/${icon}`;
  }, [slotId, weaponTypeId, isPurple]);

  // 校验函数：检查值是否在有效范围内
  const validateStatValue = (type: string, value: string): boolean => {
    if (!type || type === '生存类词条' || !value) return true;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return true;
    const max = CommonData.MAX_VALUES[type];
    if (numValue < 0) return false;
    if (max && numValue > max) return false;
    return true;
  };

  // 计算各输入框的错误状态
  const mainStatError = useMemo(() => {
    return !validateStatValue(mainStatType, mainStatValue);
  }, [mainStatType, mainStatValue]);

  const subStatErrors = useMemo(() => {
    return subStats.map((sub) => !validateStatValue(sub.type, sub.value));
  }, [subStats]);

  const dingyinError = useMemo(() => {
    return !validateStatValue(dingyinType, dingyinValue);
  }, [dingyinType, dingyinValue]);

  // 检查是否有任何校验错误
  const hasValidationError = mainStatError || subStatErrors.some(Boolean) || dingyinError;

  // 计算完成度百分比
  const getCompletionPercent = (type: string, value: string): number | null => {
    if (!type || type === '生存类词条' || !value) return null;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    const max = CommonData.MAX_VALUES[type];
    if (!max) return null;
    return Math.min(100, Math.round((numValue / max) * 100));
  };

  // 获取范围提示文本
  const getRangeHint = (type: string): string => {
    if (!type || type === '生存类词条') return '';
    const max = CommonData.MAX_VALUES[type];
    if (!max) return '';
    return `0 ~ ${max}`;
  };

  const handleAutoName = (slotValue: string, weaponValue: string) => {
    if (nameEdited) return;
    if (slotValue === '1') {
      const weapon = CommonData.WEAPON_TYPES.find((w) => w.id === weaponValue);
      if (weapon) setName(`我的${weapon.name}`);
    } else {
      const slot = CommonData.SLOTS.find((s) => s.id === slotValue);
      if (slot) setName(`我的${slot.name}`);
    }
  };

  const applyChengyin = (
    nextSubStats: { type: string; value: string }[],
    nextMainType: string,
    nextDingyinType: string
  ) => {
    if (!isChengyin) return;
    if (nextMainType && nextMainType !== '生存类词条') {
      const max = CommonData.MAX_VALUES[nextMainType];
      if (max) setMainStatValue((max * 0.94).toFixed(1));
    }
    nextSubStats.forEach((sub, idx) => {
      if (!sub.type || sub.type === '生存类词条') return;
      const max = CommonData.MAX_VALUES[sub.type];
      if (max) {
        nextSubStats[idx] = { ...sub, value: (max * 0.94).toFixed(1) };
      }
    });
    setSubStats([...nextSubStats]);
    if (nextDingyinType) {
      setDingyinType(nextDingyinType);
    }
  };

  const handleSlotChange = (value: string) => {
    setSlotId(value);
    if (value !== '1') setWeaponTypeId('');
    // 重置主词条、副词条和定音词条，因为不同装备位置的可选项不同
    setMainStatType('');
    setMainStatValue('');
    setSubStats(emptySubStats());
    setDingyinType('无');
    setDingyinValue('');
    handleAutoName(value, weaponTypeId);
  };

  const handleWeaponChange = (value: string) => {
    setWeaponTypeId(value);
    handleAutoName(slotId, value);
  };

  useEffect(() => {
    if (!open) return;
    handleAutoName(slotId, weaponTypeId);
  }, [slotId, weaponTypeId, open]);

  useEffect(() => {
    if (!open) return;
    if (!isChengyin) return;
    applyChengyin(subStats, mainStatType, dingyinType);
  }, [isChengyin, open]);

  const handleSave = () => {
    const slotName = slotOptions.find((s) => s.id === slotId)?.name || '';
    const mainIsSurvival = mainStatType === '生存类词条' || mainStatType === '生存向';
    const mainValue = mainIsSurvival ? 0 : parseFloat(mainStatValue || '0');
    const finalSubStats = subStats
      .filter((sub) => sub.type)
      .map((sub) => {
        const isSurvival = sub.type === '生存类词条' || sub.type === '生存向';
        const value = isSurvival ? 0 : parseFloat(sub.value || '0');
        return {
          type: sub.type,
          value,
          isPercent: !isSurvival && CommonData.PERCENT_STATS.includes(sub.type),
        };
      });
    const equip: EquipItem = {
      id: initialEquip?.id ?? Date.now(),
      slotId,
      slotName,
      weaponTypeId: slotId === '1' ? weaponTypeId || null : null,
      name: name || `我的${slotName}`,
      isChengyin,
      isPurple,
      isConvertible,
      icon: iconPath.replace('/', ''),
      mainStat: {
        type: mainStatType,
        value: mainValue,
        isPercent: !mainIsSurvival && CommonData.PERCENT_STATS.includes(mainStatType),
      },
      dingyinStat:
        dingyinType && dingyinType !== '无'
          ? {
              type: dingyinType,
              value: parseFloat(dingyinValue || '0'),
              isPercent: CommonData.PERCENT_STATS.includes(dingyinType),
            }
          : null,
      subStats: finalSubStats,
    };
    onSave(equip, !initialEquip);
  };

  const disableMainInput = isChengyin || mainStatType === '生存类词条';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialEquip ? '修改装备' : '录入装备'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>装备位置</Label>
                <Select value={slotId} onValueChange={handleSlotChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择位置" />
                  </SelectTrigger>
                  <SelectContent>
                    {slotOptions.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>武器种类</Label>
                <Select
                  value={weaponTypeId}
                  onValueChange={handleWeaponChange}
                  disabled={slotId !== '1'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择种类" />
                  </SelectTrigger>
                  <SelectContent>
                    {weaponOptions.map((weapon) => (
                      <SelectItem key={weapon.id} value={weapon.id}>
                        {weapon.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>装备名称</Label>
              <Input
                value={name}
                onChange={(event) => {
                  setNameEdited(true);
                  setName(event.target.value);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isChengyin} onCheckedChange={(v) => setIsChengyin(Boolean(v))} />
                承音
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isPurple} onCheckedChange={(v) => setIsPurple(Boolean(v))} />
                紫装
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isConvertible}
                  onCheckedChange={(v) => setIsConvertible(Boolean(v))}
                />
                可转律
              </label>
            </div>
            <div className="space-y-2">
              <Label>主词条</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={mainStatType}
                  onValueChange={(value) => {
                    setMainStatType(value);
                    if (value === '生存类词条') setMainStatValue('');
                    applyChengyin(subStats, value, dingyinType);
                  }}
                >
                  <SelectTrigger className="w-[140px] shrink-0">
                    <SelectValue placeholder="选择主词条" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainStatOptions.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative min-w-[100px] flex-1">
                  <Input
                    type="number"
                    value={mainStatValue}
                    onChange={(event) => setMainStatValue(event.target.value)}
                    disabled={disableMainInput}
                    placeholder="数值"
                    className="h-10 pr-9"
                    aria-invalid={mainStatError}
                  />
                  <button
                    type="button"
                    disabled={disableMainInput || !mainStatType}
                    onClick={() => {
                      const max = CommonData.MAX_VALUES[mainStatType];
                      if (max) setMainStatValue(max.toString());
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    ↑
                  </button>
                </div>
                <div className="text-muted-foreground w-[120px] shrink-0 text-right text-xs">
                  {mainStatType && mainStatType !== '生存类词条' && (
                    <>
                      <span>{getRangeHint(mainStatType)}</span>
                      {getCompletionPercent(mainStatType, mainStatValue) !== null && (
                        <span className="ml-1 text-primary">
                          ({getCompletionPercent(mainStatType, mainStatValue)}%)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>副词条（4条）</Label>
              <div className="space-y-2">
                {subStats.map((sub, idx) => {
                  const disableValue = isChengyin || sub.type === '生存类词条';
                  return (
                    <div key={`sub-${idx}`} className="flex items-center gap-2">
                      <Select
                        value={sub.type}
                        onValueChange={(value) => {
                          const next = [...subStats];
                          next[idx] = { type: value, value: next[idx].value };
                          setSubStats(next);
                          applyChengyin(next, mainStatType, dingyinType);
                        }}
                      >
                        <SelectTrigger className="w-[140px] shrink-0">
                          <SelectValue placeholder="选择词条" />
                        </SelectTrigger>
                        <SelectContent>
                          {subStatOptions.map((stat) => (
                            <SelectItem
                              key={`${stat}-${idx}`}
                              value={stat}
                              disabled={
                                stat !== '生存类词条' &&
                                subStats.some((other, sIdx) => sIdx !== idx && other.type === stat)
                              }
                            >
                              {stat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative min-w-[100px] flex-1">
                        <Input
                          type="number"
                          value={sub.value}
                          onChange={(event) => {
                            const next = [...subStats];
                            next[idx] = { ...next[idx], value: event.target.value };
                            setSubStats(next);
                          }}
                          disabled={disableValue}
                          placeholder="数值"
                          className="h-10 pr-9"
                          aria-invalid={subStatErrors[idx]}
                        />
                        <button
                          type="button"
                          disabled={disableValue || !sub.type}
                          onClick={() => {
                            const max = CommonData.MAX_VALUES[sub.type];
                            if (max) {
                              const next = [...subStats];
                              next[idx] = { ...sub, value: max.toString() };
                              setSubStats(next);
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        >
                          ↑
                        </button>
                      </div>
                      <div className="text-muted-foreground w-[120px] shrink-0 text-right text-xs">
                        {sub.type && sub.type !== '生存类词条' && (
                          <>
                            <span>{getRangeHint(sub.type)}</span>
                            {getCompletionPercent(sub.type, sub.value) !== null && (
                              <span className="ml-1 text-primary">
                                ({getCompletionPercent(sub.type, sub.value)}%)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>定音词条</Label>
              <div className="flex items-center gap-2">
                <Select value={dingyinType} onValueChange={setDingyinType}>
                  <SelectTrigger className="w-[140px] shrink-0">
                    <SelectValue placeholder="选择定音词条" />
                  </SelectTrigger>
                  <SelectContent>
                    {dingyinOptions.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative min-w-[100px] flex-1">
                  <Input
                    type="number"
                    value={dingyinValue}
                    onChange={(event) => setDingyinValue(event.target.value)}
                    disabled={dingyinType === '无'}
                    placeholder="数值"
                    className="h-10 pr-9"
                    aria-invalid={dingyinError}
                  />
                  <button
                    type="button"
                    disabled={dingyinType === '无'}
                    onClick={() => {
                      const max = CommonData.MAX_VALUES[dingyinType];
                      if (max) setDingyinValue(max.toString());
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    ↑
                  </button>
                </div>
                <div className="text-muted-foreground w-[120px] shrink-0 text-right text-xs">
                  {dingyinType && dingyinType !== '无' && (
                    <>
                      <span>{getRangeHint(dingyinType)}</span>
                      {getCompletionPercent(dingyinType, dingyinValue) !== null && (
                        <span className="ml-1 text-primary">
                          ({getCompletionPercent(dingyinType, dingyinValue)}%)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>装备预览</Label>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-3">
              <Image
                src={iconPath}
                alt="预览"
                width={80}
                height={80}
                className="rounded-md border"
              />
              <div className="text-muted-foreground text-xs">点击保存后将更新装备图标</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={hasValidationError}>保存装备</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
