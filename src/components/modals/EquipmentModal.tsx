'use client';

import { useEffect, useMemo, useState } from 'react';

import { ScanLine } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { CommonData } from '../../lib/data/commonData';
import { ocrEquipmentStats } from '../../lib/ocrParser';
import type { EquipItem } from '../../lib/types';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { OcrModal } from './OcrModal';

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
  const t = useTranslations('equipmentModal');
  const tCommon = useTranslations('common');
  const [slotId, setSlotId] = useState('1');
  const [weaponTypeId, setWeaponTypeId] = useState('');
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [isChengyin, setIsChengyin] = useState(false);
  const [isPurple, setIsPurple] = useState(false);
  const [isConvertible, setIsConvertible] = useState(false);
  const [mainStatType, setMainStatType] = useState('');
  const [mainStatValue, setMainStatValue] = useState('');
  const [dingyinType, setDingyinType] = useState('None');
  const [dingyinValue, setDingyinValue] = useState('');
  const [subStats, setSubStats] = useState<{ type: string; value: string }[]>(emptySubStats());

  // OCRXiangGuanZhuangTai
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrPreviewImage, setOcrPreviewImage] = useState<string | null>(null); // ShiBieHouDeYuLanTu

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
        setDingyinType('None');
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
    setDingyinType('None');
    setDingyinValue('');
    setSubStats(emptySubStats());
  }, [open, initialEquip]);

  const slotOptions = CommonData.SLOTS;
  const weaponOptions = CommonData.WEAPON_TYPES;

  const mainStatOptions = useMemo(() => {
    return CommonData.MAIN_STAT_RULES[slotId] || [];
  }, [slotId]);

  const dingyinOptions = useMemo(() => {
    return CommonData.DINGYIN_RULES[slotId] || ['None'];
  }, [slotId]);

  const subStatOptions = useMemo(() => {
    let opts = [...CommonData.BASE_SUB_STATS];
    if (slotId === '1') {
      const weapon = CommonData.WEAPON_TYPES.find((w) => w.id === weaponTypeId);
      if (weapon) opts.push(weapon.stat);
    }
    if (['3', '4'].includes(slotId)) opts.push('All Martial Arts Effectiveness');
    if (['5', '6'].includes(slotId)) {
      opts.push('Singletarget Technique Damage Bonus');
      opts.push('AoE Technique Damage Bonus');
    }
    if (['7', '8'].includes(slotId)) opts.push('Boss Damage Bonus');
    opts.push('ShengCunLeiAffix');
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

  // JiaoYanHanShu：JianChaZhiShiFouZaiYouXiaoFanWeiNei
  const validateStatValue = (type: string, value: string): boolean => {
    if (!type || type === 'ShengCunLeiAffix' || !value) return true;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return true;
    const max = CommonData.MAX_VALUES[type];
    if (numValue < 0) return false;
    if (max && numValue > max) return false;
    return true;
  };

  // JiSuanGeShuRuKuangDeCuoWuZhuangTai
  const mainStatError = useMemo(() => {
    return !validateStatValue(mainStatType, mainStatValue);
  }, [mainStatType, mainStatValue]);

  const subStatErrors = useMemo(() => {
    return subStats.map((sub) => !validateStatValue(sub.type, sub.value));
  }, [subStats]);

  const dingyinError = useMemo(() => {
    return !validateStatValue(dingyinType, dingyinValue);
  }, [dingyinType, dingyinValue]);

  // JianChaShiFouYouRenHeJiaoYanCuoWu
  const hasValidationError = mainStatError || subStatErrors.some(Boolean) || dingyinError;

  // JianChaShiFouXuanZeLeWuQiDanWeiXuanZeWuQiZhongLei
  const missingWeaponType = slotId === '1' && !weaponTypeId;

  // OCRAnNiuShiFouKeYong：FeiWuQiWeiZhiZhiJieKeYong，WuQiWeiZhiXuYaoXuanZeWuQiLeiXing
  const canUseOcr = slotId !== '1' || (slotId === '1' && weaponTypeId !== '');

  // DaKaiOCRMoTaiKuang
  const handleOcrClick = () => {
    setIsOcrModalOpen(true);
  };

  // OCRShiBieConfirmChuLi
  const handleOcrConfirm = async (file: File) => {
    setIsOcrLoading(true);
    try {
      const result = await ocrEquipmentStats(file, slotId, weaponTypeId || undefined);
      console.log('[OCR] Parse result:', result);

      // SheZhiKeZhuanLBiaoJi：You[Zhuan]ShuoMingYiZhuanL，BuGouXuan；MeiYou[Zhuan]ShuoMingKeZhuanL，GouXuan
      if (result.convertedStat) {
        // YiJingZhuanLGuoLe，BuKeZaiZhuan
        setIsConvertible(false);
        console.log('[OCR] Has converted stat, setting isConvertible to false');
      } else {
        // MeiYouZhuanL，KeYiZhuanL
        setIsConvertible(true);
        console.log('[OCR] No converted stat, setting isConvertible to true');
      }

      // ShouJiSuoYouYaoTianChongDeSecondary Affix（AnJieXiShunXu，BaoKuoZhuanLAffix）
      const allSubStats: { type: string; value: string }[] = [];
      const seenTypes = new Set<string>(); // YongYuQuZhong

      // TianJiaSecondary Affix（YiBaoHanZhuanLAffix，AnYuanShiShunXu）
      for (const stat of result.subStats) {
        if (allSubStats.length < 4) {
          if (!seenTypes.has(stat.type)) {
            // BuChongFuDeAffixZhengChangTianJia
            allSubStats.push({ type: stat.type, value: stat.value.toString() });
            seenTypes.add(stat.type);
          } else {
            // ChongFuDeAffixSheWeiKong
            console.log('[OCR] Duplicate stat type, skipping:', stat.type);
          }
        }
      }

      // TianChongSecondary Affix
      const newSubStats = emptySubStats();
      allSubStats.forEach((stat, idx) => {
        newSubStats[idx] = stat;
      });
      setSubStats(newSubStats);
      console.log('[OCR] Setting subStats:', newSubStats);

      // TianChongDingyin Affix
      if (result.dingyinStat) {
        setDingyinType(result.dingyinStat.type);
        setDingyinValue(result.dingyinStat.value.toString());
        console.log('[OCR] Setting dingyin:', result.dingyinStat);
      }

      // TianChongPrimary Affix（RuGuoYouDeHua）
      if (result.mainStat) {
        setMainStatType(result.mainStat.type);
        setMainStatValue(result.mainStat.value.toString());
        console.log('[OCR] Setting mainStat:', result.mainStat);
      }

      // SaveYuLanTuPianGongYongHuJiaoYan
      const imageUrl = URL.createObjectURL(file);
      setOcrPreviewImage(imageUrl);

      // GuanBiOCRMoTaiKuang
      setIsOcrModalOpen(false);
    } catch (error) {
      console.error('[OCR] Recognition failed:', error);
      alert(t('ocrError'));
    } finally {
      setIsOcrLoading(false);
    }
  };

  // JiSuanWanChengDuBaiFenBi
  const getCompletionPercent = (type: string, value: string): number | null => {
    if (!type || type === 'ShengCunLeiAffix' || !value) return null;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    const max = CommonData.MAX_VALUES[type];
    if (!max) return null;
    return Math.min(100, Math.round((numValue / max) * 100));
  };

  // HuoQuFanWeiTiShiWenBen
  const getRangeHint = (type: string): string => {
    if (!type || type === 'ShengCunLeiAffix') return '';
    const max = CommonData.MAX_VALUES[type];
    if (!max) return '';
    return `0 ~ ${max}`;
  };

  const handleAutoName = (slotValue: string, weaponValue: string) => {
    if (nameEdited) return;
    if (slotValue === '1') {
      const weapon = CommonData.WEAPON_TYPES.find((w) => w.id === weaponValue);
      if (weapon) setName(`WoDe${weapon.name}`);
    } else {
      const slot = CommonData.SLOTS.find((s) => s.id === slotValue);
      if (slot) setName(`WoDe${slot.name}`);
    }
  };

  const applyChengyin = (
    nextSubStats: { type: string; value: string }[],
    nextMainType: string,
    nextDingyinType: string
  ) => {
    if (!isChengyin) return;
    if (nextMainType && nextMainType !== 'ShengCunLeiAffix') {
      const max = CommonData.MAX_VALUES[nextMainType];
      if (max) setMainStatValue((max * 0.94).toFixed(1));
    }
    nextSubStats.forEach((sub, idx) => {
      if (!sub.type || sub.type === 'ShengCunLeiAffix') return;
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
    const newWeaponTypeId = value !== '1' ? '' : weaponTypeId;
    if (value !== '1') setWeaponTypeId('');
    // ZhongZhiPrimary Affix、Secondary AffixHeDingyin Affix，YinWeiBuTongEquipmentWeiZhiDeKeXuanXiangBuTong
    setMainStatType('');
    setMainStatValue('');
    setSubStats(emptySubStats());
    setDingyinType('None');
    setDingyinValue('');
    // QieHuanEquipmentWeiZhiShiZhongZhi nameEdited，YunXuZiDongMingMing
    setNameEdited(false);
    handleAutoName(value, newWeaponTypeId);
  };

  const handleWeaponChange = (value: string) => {
    setWeaponTypeId(value);
    // QieHuanWuQiZhongLeiShiZhongZhi nameEdited，YunXuZiDongMingMing
    setNameEdited(false);
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
    const mainIsSurvival = mainStatType === 'ShengCunLeiAffix' || mainStatType === 'ShengCunXiang';
    const mainValue = mainIsSurvival ? 0 : parseFloat(mainStatValue || '0');
    const finalSubStats = subStats
      .filter((sub) => sub.type)
      .map((sub) => {
        const isSurvival = sub.type === 'ShengCunLeiAffix' || sub.type === 'ShengCunXiang';
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
      name: name || `WoDe${slotName}`,
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
        dingyinType && dingyinType !== 'None'
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

  const disableMainInput = isChengyin || mainStatType === 'ShengCunLeiAffix';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`!flex !flex-col gap-0 p-0 max-h-[90vh] ${ocrPreviewImage ? 'max-w-4xl sm:max-w-4xl' : 'max-w-2xl sm:max-w-2xl'}`}>
        <DialogHeader className="shrink-0 border-b border-border/40 px-4 sm:px-6 py-4">
          <DialogTitle className="text-base sm:text-lg">{initialEquip ? t('editTitle') : t('addTitle')}</DialogTitle>
        </DialogHeader>
        <div className={`flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 ${ocrPreviewImage ? 'flex flex-col sm:flex-row gap-4' : ''}`}>
        {/* ZhuBiaoDanQuYu */}
        <div className={`space-y-4 sm:space-y-5 ${ocrPreviewImage ? 'flex-1' : ''}`}>
          {/* DingBuQuYu：EquipmentYuLan + JiBenXinXi */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* EquipmentYuLan */}
            <div className="flex shrink-0 flex-row sm:flex-col items-center gap-2 sm:gap-1">
              <Image
                src={iconPath}
                alt={t('preview')}
                width={56}
                height={56}
                className="rounded-md border sm:w-[72px] sm:h-[72px]"
              />
              <span className="text-muted-foreground text-xs">{t('preview')}</span>
            </div>
            {/* JiBenXinXi */}
            <div className="flex-1 space-y-2 sm:space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('equipmentSlot')}</Label>
                  <Select value={slotId} onValueChange={handleSlotChange}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder={t('selectSlot')} />
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
                <div className="space-y-1">
                  <Label className="text-xs">{t('weaponType')}</Label>
                  <Select
                    value={weaponTypeId}
                    onValueChange={handleWeaponChange}
                    disabled={slotId !== '1'}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder={t('selectType')} />
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
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">{t('equipmentName')}</Label>
                  <Input
                    value={name}
                    onChange={(event) => {
                      setNameEdited(true);
                      setName(event.target.value);
                    }}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div className="flex shrink-0 gap-2 sm:gap-3 pb-0 sm:pb-1 flex-wrap">
                  <label className="flex items-center gap-1 sm:gap-1.5 text-xs">
                    <Checkbox
                      checked={isChengyin}
                      onCheckedChange={(v) => setIsChengyin(Boolean(v))}
                      className="h-4 w-4"
                    />
                    {t('chengyin')}
                  </label>
                  <label className="flex items-center gap-1 sm:gap-1.5 text-xs">
                    <Checkbox checked={isPurple} onCheckedChange={(v) => setIsPurple(Boolean(v))} className="h-4 w-4" />
                    {t('purple')}
                  </label>
                  <label className="flex items-center gap-1 sm:gap-1.5 text-xs">
                    <Checkbox
                      checked={isConvertible}
                      onCheckedChange={(v) => setIsConvertible(Boolean(v))}
                      className="h-4 w-4"
                    />
                    {t('convertible')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* FenGeXian */}
          <div className="border-border border-t" />

          {/* AffixQuYu */}
          <div className="space-y-3 sm:space-y-4">
            {/* Primary Affix */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t('mainStat')}</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                <Select
                  value={mainStatType}
                  onValueChange={(value) => {
                    setMainStatType(value);
                    if (value === 'ShengCunLeiAffix') setMainStatValue('');
                    applyChengyin(subStats, value, dingyinType);
                  }}
                >
                  <SelectTrigger className="h-8 sm:h-9 w-full sm:w-[140px] shrink-0 text-xs sm:text-sm">
                    <SelectValue placeholder={t('selectMainStat')} />
                  </SelectTrigger>
                  <SelectContent>
                    {mainStatOptions.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <div className="relative min-w-[80px] sm:min-w-[100px] flex-1">
                    <Input
                      type="number"
                      value={mainStatValue}
                      onChange={(event) => setMainStatValue(event.target.value)}
                      disabled={disableMainInput}
                      placeholder="ShuZhi"
                      className="h-8 sm:h-9 pr-8 text-xs sm:text-sm"
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
                  <div className="text-muted-foreground w-[70px] sm:w-[100px] shrink-0 text-right text-[10px] sm:text-xs">
                    {mainStatType && mainStatType !== 'ShengCunLeiAffix' && (
                      <>
                        <span className="hidden sm:inline">{getRangeHint(mainStatType)}</span>
                        {getCompletionPercent(mainStatType, mainStatValue) !== null && (
                          <span className="text-primary sm:ml-1">
                            {getCompletionPercent(mainStatType, mainStatValue)}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Affix */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t('subStats')}</Label>
              <div className="space-y-1.5 sm:space-y-2">
                {subStats.map((sub, idx) => {
                  const disableValue = isChengyin || sub.type === 'ShengCunLeiAffix';
                  return (
                    <div key={`sub-${idx}`} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                      <Select
                        value={sub.type}
                        onValueChange={(value) => {
                          const next = [...subStats];
                          next[idx] = { type: value, value: next[idx].value };
                          setSubStats(next);
                          applyChengyin(next, mainStatType, dingyinType);
                        }}
                      >
                        <SelectTrigger className="h-8 sm:h-9 w-full sm:w-[140px] shrink-0 text-xs sm:text-sm">
                          <SelectValue placeholder={t('selectStat')} />
                        </SelectTrigger>
                        <SelectContent>
                          {subStatOptions.map((stat) => (
                            <SelectItem
                              key={`${stat}-${idx}`}
                              value={stat}
                              disabled={
                                stat !== 'ShengCunLeiAffix' &&
                                subStats.some((other, sIdx) => sIdx !== idx && other.type === stat)
                              }
                            >
                              {stat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <div className="relative min-w-[60px] flex-1">
                          <Input
                            type="number"
                            value={sub.value}
                            onChange={(event) => {
                              const next = [...subStats];
                              next[idx] = { ...next[idx], value: event.target.value };
                              setSubStats(next);
                            }}
                            disabled={disableValue}
                            placeholder="ShuZhi"
                            className="h-8 sm:h-9 pr-8 text-xs sm:text-sm"
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
                        <div className="text-muted-foreground w-[60px] sm:w-[100px] shrink-0 text-right text-[10px] sm:text-xs">
                          {sub.type && sub.type !== 'ShengCunLeiAffix' && (
                            <>
                              <span className="hidden sm:inline">{getRangeHint(sub.type)}</span>
                              {getCompletionPercent(sub.type, sub.value) !== null && (
                                <span className="text-primary sm:ml-1">
                                  {getCompletionPercent(sub.type, sub.value)}%
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dingyin Affix */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t('dingyinStat')}</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                <Select value={dingyinType} onValueChange={setDingyinType}>
                  <SelectTrigger className="h-8 sm:h-9 w-full sm:w-[140px] shrink-0 text-xs sm:text-sm">
                    <SelectValue placeholder={t('selectDingyin')} />
                  </SelectTrigger>
                  <SelectContent>
                    {dingyinOptions.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <div className="relative min-w-[80px] sm:min-w-[100px] flex-1">
                    <Input
                      type="number"
                      value={dingyinValue}
                      onChange={(event) => setDingyinValue(event.target.value)}
                      disabled={dingyinType === 'None'}
                      placeholder="ShuZhi"
                      className="h-8 sm:h-9 pr-8 text-xs sm:text-sm"
                      aria-invalid={dingyinError}
                    />
                    <button
                      type="button"
                      disabled={dingyinType === 'None'}
                      onClick={() => {
                        const max = CommonData.MAX_VALUES[dingyinType];
                        if (max) setDingyinValue(max.toString());
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      ↑
                    </button>
                  </div>
                  <div className="text-muted-foreground w-[60px] sm:w-[100px] shrink-0 text-right text-[10px] sm:text-xs">
                    {dingyinType && dingyinType !== 'None' && (
                      <>
                        <span className="hidden sm:inline">{getRangeHint(dingyinType)}</span>
                        {getCompletionPercent(dingyinType, dingyinValue) !== null && (
                          <span className="text-primary sm:ml-1">
                            {getCompletionPercent(dingyinType, dingyinValue)}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* OCR YuLanTuQuYu */}
        {ocrPreviewImage && (
          <div className="w-full sm:w-64 shrink-0 space-y-2">
            <Label className="text-xs">{t('ocrPreview')}</Label>
            <div className="rounded-md border bg-black/20 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ocrPreviewImage}
                alt={t('ocrImage')}
                className="max-h-48 sm:max-h-96 w-full rounded object-contain"
              />
            </div>
          </div>
        )}
        </div>
        <DialogFooter className="shrink-0 flex-row flex-wrap gap-2 justify-between sm:justify-between border-t border-border/40 px-4 sm:px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOcrClick}
            disabled={!canUseOcr}
            title={!canUseOcr ? t('selectWeaponFirst') : t('ocrTooltip')}
            className="text-xs sm:text-sm order-3 sm:order-1 flex-1 sm:flex-none"
          >
            <ScanLine className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('ocr')}
          </Button>
          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} className="text-xs sm:text-sm flex-1 sm:flex-none">
              {tCommon('cancel')}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={hasValidationError || missingWeaponType} className="text-xs sm:text-sm flex-1 sm:flex-none">
              {t('save')}
            </Button>
          </div>
        </DialogFooter>

        {/* OCRShiBieMoTaiKuang */}
        <OcrModal
          open={isOcrModalOpen}
          onOpenChange={setIsOcrModalOpen}
          onConfirm={handleOcrConfirm}
          isLoading={isOcrLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
