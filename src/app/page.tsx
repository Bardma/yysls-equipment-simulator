'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { EquipmentModal } from '../components/modals/EquipmentModal';
import { GraduationModal } from '../components/modals/GraduationModal';
import { ImportExportModal } from '../components/modals/ImportExportModal';
import { XinfaModal } from '../components/modals/XinfaModal';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Calculator } from '../lib/calculator';
import { ClassConfig } from '../lib/data/classConfig';
import { CommonData } from '../lib/data/commonData';
import { buildStatsDisplay } from '../lib/statsDisplay';
import {
  clearAccountData,
  loadEquipData,
  loadRightPanelState,
  saveRightPanelState,
} from '../lib/storage';
import type { EquipItem, EquippedItems } from '../lib/types';
import { useAccountStore } from '../stores/accountStore';
import { useEquipmentStore } from '../stores/equipmentStore';
import { useSimulationStore } from '../stores/simulationStore';

const SLOT_LABELS: Record<keyof EquippedItems, string> = {
  weapon1: '武器1',
  weapon2: '武器2',
  head: '冠胄',
  chest: '胸甲',
  ring: '环',
  pendant: '佩',
  legs: '胫甲',
  hands: '腕甲',
};

const bowOptions = [
  { value: 'precision', label: '精准弓' },
  { value: 'crit', label: '会心弓' },
  { value: 'intent', label: '会意弓' },
];

const formatDisplayTotals = (totals: Record<string, number>) => {
  const displayTotals: Record<string, number> = { ...totals };
  for (const key in displayTotals) {
    const val = Number(displayTotals[key]) || 0;
    const isPercent =
      CommonData.PERCENT_STATS.includes(key) ||
      key.includes('率') ||
      key.includes('增效') ||
      key.includes('加成') ||
      key.includes('增伤') ||
      key.includes('穿透');
    displayTotals[key] = isPercent ? parseFloat(val.toFixed(1)) : Math.round(val);
  }
  return displayTotals;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [createName, setCreateName] = useState('');
  const [equipModalOpen, setEquipModalOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<EquipItem | null>(null);
  const [xinfaModalOpen, setXinfaModalOpen] = useState(false);
  const [xinfaIndex, setXinfaIndex] = useState(0);
  const [gradModalOpen, setGradModalOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [rightPanels, setRightPanels] = useState({
    simulation: true,
    graduation: true,
    stats: true,
  });

  const {
    accounts,
    currentAccount,
    hydrated,
    hydrate,
    createAccount,
    deleteAccount,
    setCurrentAccount,
  } = useAccountStore();
  const {
    db,
    filter,
    hydrate: hydrateDb,
    setFilter,
    addEquip,
    updateEquip,
    deleteEquip,
    replaceAll,
  } = useEquipmentStore();
  const {
    currentClass,
    bowType,
    setType,
    xinfaLoadout,
    earlySeasonBonus,
    equippedItems,
    hydrateForAccount,
    setCurrentClass,
    setBowType,
    setSetType,
    setXinfaLoadout,
    setEarlySeasonBonus,
    equipSlot,
    updateEquipsById,
  } = useSimulationStore();

  useEffect(() => {
    setMounted(true);
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const items = loadEquipData(currentAccount);
    hydrateDb(items);
    hydrateForAccount(currentAccount, items);
  }, [hydrated, currentAccount, hydrateDb, hydrateForAccount]);

  useEffect(() => {
    if (!mounted) return;
    setRightPanels(loadRightPanelState(currentAccount));
  }, [mounted, currentAccount]);

  const totals = useMemo(() => {
    if (!currentAccount) return null;
    return Calculator.calculateTotal(
      equippedItems,
      currentClass,
      bowType,
      xinfaLoadout,
      setType,
      false,
      null,
      earlySeasonBonus
    );
  }, [
    currentAccount,
    equippedItems,
    currentClass,
    bowType,
    xinfaLoadout,
    setType,
    earlySeasonBonus,
  ]);

  const rotationConfig = ClassConfig.ROTATIONS[currentClass];
  const rotation = rotationConfig?.rotation || [];
  const baseline = rotationConfig?.baseline || 4244078.34;
  const useTime = rotationConfig?.useTime || 1;
  const skillDb = rotationConfig?.skillDatabase || {};

  const graduationInfo = useMemo(() => {
    if (!totals || rotation.length === 0) return null;
    const accParams = { ...totals, 套装: setType, 心法: xinfaLoadout, 当前流派: currentClass };
    const accResult = Calculator.calculateGraduationRate(
      accParams,
      skillDb,
      rotation,
      baseline,
      false
    );
    const displayTotals = formatDisplayTotals(totals);
    const excelParams = {
      ...displayTotals,
      套装: setType,
      心法: xinfaLoadout,
      当前流派: currentClass,
    };
    const excelResult = Calculator.calculateGraduationRate(
      excelParams,
      skillDb,
      rotation,
      baseline,
      false
    );
    const dps = Math.round(accResult.totalDamage / useTime);
    return {
      accurate: accResult.graduationRate,
      excel: excelResult.graduationRate,
      dps,
    };
  }, [totals, rotation, setType, xinfaLoadout, currentClass, skillDb, baseline, useTime]);

  const statDisplay = useMemo(() => {
    if (!totals) return [];
    return buildStatsDisplay(formatDisplayTotals(totals), currentClass, setType);
  }, [totals, currentClass, setType]);

  const handleCreateAccount = () => {
    const success = createAccount(createName);
    if (success) setCreateName('');
  };

  const handleDeleteAccount = () => {
    if (!currentAccount) return;
    if (!window.confirm('确定删除当前角色？')) return;
    clearAccountData(currentAccount);
    deleteAccount(currentAccount);
  };

  const handleSaveEquip = (equip: EquipItem, isNew: boolean) => {
    if (!currentAccount) return;
    if (isNew) {
      addEquip(currentAccount, equip);
      if (equip.slotId === '1') {
        if (!equippedItems.weapon1) equipSlot(currentAccount, 'weapon1', equip);
        else if (!equippedItems.weapon2) equipSlot(currentAccount, 'weapon2', equip);
      } else {
        const slotKeyMap: Record<string, keyof EquippedItems> = {
          '3': 'ring',
          '4': 'pendant',
          '5': 'head',
          '6': 'chest',
          '7': 'legs',
          '8': 'hands',
        };
        const slotKey = slotKeyMap[equip.slotId];
        if (slotKey && !equippedItems[slotKey]) {
          equipSlot(currentAccount, slotKey, equip);
        }
      }
    } else {
      updateEquip(currentAccount, equip);
      updateEquipsById([equip]);
    }
    setEquipModalOpen(false);
    setEditingEquip(null);
  };

  const handleDeleteEquip = (equipId: number | string) => {
    if (!currentAccount) return;
    if (!window.confirm('删除后无法恢复，确定？')) return;
    deleteEquip(currentAccount, equipId);
    (Object.keys(equippedItems) as Array<keyof EquippedItems>).forEach((slotKey) => {
      const item = equippedItems[slotKey];
      if (item && item.id === equipId) {
        equipSlot(currentAccount, slotKey, null);
      }
    });
  };

  const applyBuild = (buildEquips: EquippedItems) => {
    if (!currentAccount) return;
    (Object.keys(buildEquips) as Array<keyof EquippedItems>).forEach((slotKey) => {
      const equip = buildEquips[slotKey];
      if (!equip) {
        equipSlot(currentAccount, slotKey, null);
        return;
      }
      let equipId = equip.id;
      if (typeof equipId === 'string' && equipId.includes('_chengyin')) {
        equipId = equipId.replace('_chengyin', '');
      }
      let found = db.find((item) => `${item.id}` === `${equipId}`);
      if (!found && equip.name) {
        const targetSlotId = equip.slotId;
        found = db.find((item) => item.name === equip.name && item.slotId === targetSlotId);
      }
      equipSlot(currentAccount, slotKey, found || null);
    });
  };

  const equipItemById = (id: number | string) => {
    const item = db.find((equip) => equip.id === id);
    if (!item) return;
    if (item.slotId === '1') {
      const allowed = ClassConfig.WEAPON_RULES[currentClass] || [];
      if (!allowed.includes(item.weaponTypeId || '')) {
        alert('当前流派无法装备此类型的武器');
        return;
      }
      const w1 = equippedItems.weapon1;
      const w2 = equippedItems.weapon2;
      if (w1 && w1.weaponTypeId === item.weaponTypeId) {
        equipSlot(currentAccount, 'weapon1', item);
      } else if (w2 && w2.weaponTypeId === item.weaponTypeId) {
        equipSlot(currentAccount, 'weapon2', item);
      } else {
        if (!w1) equipSlot(currentAccount, 'weapon1', item);
        else if (!w2) equipSlot(currentAccount, 'weapon2', item);
        else equipSlot(currentAccount, 'weapon1', item);
      }
      return;
    }
    const slotKeyMap: Record<string, keyof EquippedItems> = {
      '3': 'ring',
      '4': 'pendant',
      '5': 'head',
      '6': 'chest',
      '7': 'legs',
      '8': 'hands',
    };
    const slotKey = slotKeyMap[item.slotId];
    if (slotKey) equipSlot(currentAccount, slotKey, item);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="border-border/40 bg-background/95 sticky top-0 z-50 h-14 w-full border-b backdrop-blur" />
        <main className="container mx-auto max-w-screen-2xl flex-1 p-4">
          <div className="flex h-[60vh] items-center justify-center">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        </main>
      </div>
    );
  }

  const toggleRightPanel = (key: 'simulation' | 'graduation' | 'stats') => {
    setRightPanels((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveRightPanelState(currentAccount, next);
      return next;
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="relative z-50 w-full shrink-0 border-b border-slate-700/50 bg-linear-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md">
        <div className="absolute inset-0 bg-linear-to-r from-slate-500/5 via-transparent to-slate-500/5 pointer-events-none" />
        <div className="container relative mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-linear-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-900/50 border border-slate-500/20">
              <span className="text-white text-lg">⚔</span>
            </div>
            <div>
              <div className="font-bold tracking-tight text-lg bg-linear-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent">
                燕云十六声
              </div>
              <div className="text-xs text-slate-400 -mt-0.5">装备毕业率管理器</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <span className="text-slate-400 text-xs">当前角色</span>
              <Select
                value={currentAccount ?? ''}
                onValueChange={(value) => setCurrentAccount(value || null)}
              >
                <SelectTrigger className="w-[160px] cursor-pointer border-slate-600/50 bg-slate-800/50 text-slate-100 hover:bg-slate-700/50">
                  <SelectValue placeholder="请选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-6 w-px bg-slate-600/40" />
            <div className="flex items-center gap-2">
              <input
                className="h-9 w-36 rounded-md border border-slate-600/50 bg-slate-800/50 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                placeholder="新建角色名称"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
              />
              <Button
                className="cursor-pointer bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-md shadow-slate-900/30"
                onClick={handleCreateAccount}
              >
                + 新建
              </Button>
              <Button
                variant="ghost"
                className="cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                onClick={handleDeleteAccount}
                disabled={!currentAccount}
              >
                删除
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer border-slate-600/50 text-slate-300 hover:bg-slate-700/30 hover:text-slate-200"
                onClick={() => setImportExportOpen(true)}
                disabled={!currentAccount}
              >
                导入/导出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto min-h-0 max-w-screen-2xl flex-1 overflow-hidden p-4">
        {!currentAccount ? (
          <Card className="relative flex min-h-[60vh] flex-col items-center justify-center p-10 text-center overflow-hidden border-violet-500/20 bg-linear-to-br from-violet-500/5 via-transparent to-indigo-500/5">
            <div className="absolute top-0 left-0 w-48 h-48 bg-linear-to-br from-violet-500/10 to-transparent rounded-br-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-linear-to-tl from-indigo-500/10 to-transparent rounded-tl-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
                <span className="text-white text-3xl">⚔</span>
              </div>
              <h2 className="mb-3 text-2xl font-bold bg-linear-to-r from-violet-200 via-white to-indigo-200 bg-clip-text text-transparent">
                欢迎使用燕云十六声装备毕业率管理器
              </h2>
              <p className="text-violet-300/70 max-w-md">
                请在顶部创建或选择角色后开始录入装备与模拟
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid h-full min-h-0 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
            <section className="h-full min-h-0 space-y-4 overflow-y-auto pr-2">
              <Card className="p-4 border-slate-500/20 bg-linear-to-br from-slate-500/5 via-transparent to-slate-600/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-500/20 text-slate-300 text-xs">📦</span>
                    装备库
                  </h3>
                  <Button
                    size="sm"
                    className="cursor-pointer bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-md shadow-slate-900/20"
                    onClick={() => {
                      setEditingEquip(null);
                      setEquipModalOpen(true);
                    }}
                  >
                    + 录入装备
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className={`cursor-pointer transition-all ${
                      filter === 'all'
                        ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-sm'
                        : 'bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 border-slate-500/30'
                    }`}
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    全部
                  </Button>
                  {CommonData.SLOTS.map((slot) => (
                    <Button
                      key={slot.id}
                      size="sm"
                      className={`cursor-pointer transition-all ${
                        filter === slot.id
                          ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-sm'
                          : 'bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 border-slate-500/30'
                      }`}
                      variant={filter === slot.id ? 'default' : 'outline'}
                      onClick={() => setFilter(slot.id)}
                    >
                      {slot.name}
                    </Button>
                  ))}
                </div>
              </Card>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {db.length === 0 ? (
                  <Card className="col-span-full p-8 text-center border-slate-500/20 bg-slate-500/5">
                    <div className="text-slate-400">当前数据库无装备，请点击上方录入装备按钮。</div>
                  </Card>
                ) : (
                  db
                    .filter((item) => (filter === 'all' ? true : item.slotId === filter))
                    .map((equip) => {
                      const isEquipped = Object.values(equippedItems).some(
                        (item) => item && item.id === equip.id
                      );
                      return (
                        <Card
                          key={equip.id}
                          className={`cursor-pointer p-4 transition-all border-slate-500/20 bg-slate-800/30 hover:bg-slate-800/50 ${
                            isEquipped
                              ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-md shadow-amber-500/10'
                              : 'hover:border-slate-400/40'
                          }`}
                          onClick={() => equipItemById(equip.id)}
                        >
                          <div className="-mt-1 flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-slate-400 hover:text-slate-300 hover:bg-slate-500/20"
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditingEquip(equip);
                                setEquipModalOpen(true);
                              }}
                            >
                              ✎
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 h-7 w-7"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteEquip(equip.id);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <Image
                              src={`/${equip.icon}`}
                              alt={equip.name}
                              width={48}
                              height={48}
                              className="rounded-md border border-slate-500/30 shadow-sm"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-slate-100">{equip.name}</div>
                              <div className="text-slate-400 text-xs">
                                {equip.slotName} {equip.isChengyin ? '(承音)' : ''}
                              </div>
                            </div>
                          </div>
                          <Separator className="my-3 bg-slate-600/40" />
                          <div className="space-y-1.5 text-xs">
                            {(() => {
                              const mainMaxVal = CommonData.MAX_VALUES[equip.mainStat.type] || 0;
                              const mainRatio = mainMaxVal > 0 ? equip.mainStat.value / mainMaxVal : 0;
                              const isMainHighQuality = mainRatio > 0.875;
                              return (
                                <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-1 ${
                                  isMainHighQuality ? 'text-amber-400' : 'text-[#dfa8ff]'
                                }`}>
                                  <span className="w-3" />
                                  <span className="truncate">{equip.mainStat.type}</span>
                                  <span className={`text-right tabular-nums ${isMainHighQuality ? 'font-medium' : 'font-medium'}`}>
                                    +{equip.mainStat.value}
                                    {equip.mainStat.isPercent ? '%' : ''}
                                  </span>
                                </div>
                              );
                            })()}
                            {equip.subStats.map((sub, idx) => {
                              const maxVal = CommonData.MAX_VALUES[sub.type] || 0;
                              const ratio = maxVal > 0 ? sub.value / maxVal : 0;
                              const isHighQuality = ratio > 0.875;
                              return (
                                <div
                                  key={`${equip.id}-sub-${idx}`}
                                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-1 ${
                                    isHighQuality
                                      ? 'text-amber-400'
                                      : 'text-[#dfa8ff]/85'
                                  }`}
                                >
                                  <span className="w-3 text-center">·</span>
                                  <span className="truncate">{sub.type}</span>
                                  <span className={`text-right tabular-nums ${isHighQuality ? 'font-medium' : ''}`}>
                                    +{sub.value}
                                    {sub.isPercent ? '%' : ''}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      );
                    })
                )}
              </div>
            </section>

            <section className="flex flex-col gap-3 self-start overflow-hidden">
              <Card className="p-4 gap-2 border-sky-500/20 bg-linear-to-br from-sky-500/5 via-transparent to-cyan-500/5">
                <div
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1 text-left"
                  onClick={() => toggleRightPanel('simulation')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleRightPanel('simulation');
                    }
                  }}
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 text-xs">⚔</span>
                    穿戴模拟
                  </h3>
                  {rightPanels.simulation ? (
                    <ChevronUp className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                  )}
                </div>
                {rightPanels.simulation ? (
                  <div className="mt-3 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="text-sky-300/80 text-xs font-medium">流派</label>
                        <Select
                          value={currentClass}
                          onValueChange={(value) => setCurrentClass(currentAccount, value, db)}
                        >
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ClassConfig.CLASSES.map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                {cls}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sky-300/80 text-xs font-medium">弓诀</label>
                        <Select
                          value={bowType}
                          onValueChange={(value) => setBowType(currentAccount, value)}
                        >
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {bowOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sky-300/80 text-xs font-medium">套装</label>
                        <Select
                          value={setType}
                          onValueChange={(value) => setSetType(currentAccount, value)}
                        >
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(CommonData.SET_DATA).map((setName) => (
                              <SelectItem key={setName} value={setName}>
                                {setName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          'weapon1',
                          'weapon2',
                          'head',
                          'chest',
                          'ring',
                          'pendant',
                          'legs',
                          'hands',
                        ] as Array<keyof EquippedItems>
                      ).map((slotKey) => {
                        const item = equippedItems[slotKey];
                        return (
                          <Card key={slotKey} className="p-2 border-sky-500/10 hover:border-sky-500/30 transition-colors">
                            <div className="border-sky-500/20 bg-sky-950/20 relative flex h-16 w-full items-center justify-center overflow-hidden rounded-md border">
                              {item ? (
                                <>
                                  <Image
                                    src={`/${item.icon}`}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/70 py-1">
                                    <span className="text-xs font-medium text-white px-1 text-center leading-tight truncate">
                                      {item.name}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  {SLOT_LABELS[slotKey]}
                                </span>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sky-300/80 text-xs font-medium">心法配置</div>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, idx) => {
                          const name = xinfaLoadout[idx] || '';
                          const lockedList = ClassConfig.XINFA_LOCKED[currentClass] || [];
                          const isLocked = name && lockedList.includes(name);
                          return (
                            <button
                              key={`xinfa-${idx}`}
                              className={`rounded-lg border p-2 text-xs ${
                                isLocked
                                  ? 'border-muted-foreground/60 text-muted-foreground bg-muted/10 cursor-not-allowed border-dashed'
                                  : 'border-border/60 cursor-pointer'
                              }`}
                              onClick={() => {
                                if (isLocked) return;
                                setXinfaIndex(idx);
                                setXinfaModalOpen(true);
                              }}
                            >
                              <div
                                className={`relative flex h-16 w-full items-center justify-center overflow-hidden rounded-md border ${
                                  isLocked ? 'border-muted-foreground/40' : 'border-border/60'
                                }`}
                              >
                                {name ? (
                                  <>
                                    <Image
                                      src={`/icon/${name}.jpg`}
                                      alt={name}
                                      width={64}
                                      height={64}
                                      className="object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center bg-black/70 py-1">
                                      <span className="text-xs font-medium text-white px-1 text-center leading-tight truncate w-full">
                                        {name}
                                      </span>
                                      {isLocked ? (
                                        <span className="text-[10px] text-white/70">不可变更</span>
                                      ) : null}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground text-[10px]">
                                    点击选择
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>

              <Card className="p-4 gap-2 overflow-hidden border-amber-500/20 bg-linear-to-br from-amber-500/5 via-transparent to-orange-500/5">
                <div
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1 text-left"
                  onClick={() => toggleRightPanel('graduation')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleRightPanel('graduation');
                    }
                  }}
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 text-xs">🎓</span>
                    当前毕业率
                  </h3>
                  {rightPanels.graduation ? (
                    <ChevronUp className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                  )}
                </div>
                {rightPanels.graduation ? (
                  <div className="mt-3 space-y-4">
                    {rotation.length === 0 || !graduationInfo ? (
                      <div className="text-muted-foreground text-sm">
                        毕业率表格未配置，请等待更新
                      </div>
                    ) : (
                      <div className="relative rounded-xl bg-linear-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 p-4 border border-yellow-500/20">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-yellow-400/20 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="relative space-y-3">
                          <div className="text-5xl font-bold bg-linear-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
                            {graduationInfo.accurate}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">E</span>
                              <span className="text-muted-foreground">表格显示</span>
                              <span className="ml-auto font-medium text-yellow-200/90">{graduationInfo.excel}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-orange-500/20 text-orange-400 text-xs font-medium">D</span>
                              <span className="text-muted-foreground">轴期望秒伤</span>
                              <span className="ml-auto font-medium text-orange-200/90">{graduationInfo.dps.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-1">
                      <Checkbox
                        checked={earlySeasonBonus}
                        onCheckedChange={(value) =>
                          setEarlySeasonBonus(currentAccount, Boolean(value))
                        }
                      />
                      <span className="text-muted-foreground text-xs">
                        提前获得下半赛季属性（毕业率将虚高）
                      </span>
                    </div>
                    <Button
                      className="w-full cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20"
                      onClick={() => setGradModalOpen(true)}
                    >
                      毕业率分析
                    </Button>
                  </div>
                ) : null}
              </Card>

              <Card
                className={`p-4 gap-2 border-emerald-500/20 bg-linear-to-br from-emerald-500/5 via-transparent to-teal-500/5 ${rightPanels.stats ? 'flex-1 overflow-y-auto' : 'overflow-hidden'}`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1 text-left"
                  onClick={() => toggleRightPanel('stats')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleRightPanel('stats');
                    }
                  }}
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 text-xs">📊</span>
                    面板属性
                  </h3>
                  {rightPanels.stats ? (
                    <ChevronUp className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                  )}
                </div>
                {rightPanels.stats ? (
                  <div className="mt-3 space-y-2">
                    {statDisplay.length === 0 ? (
                      <div className="text-muted-foreground text-sm">暂无面板属性</div>
                    ) : (
                      <div className="space-y-1.5 text-sm">
                        {statDisplay.map((item) => (
                          <div key={item.label} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-emerald-500/5 transition-colors">
                            <span className="text-emerald-300/70">{item.label}</span>
                            <span className="font-medium text-emerald-100/90">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </Card>
            </section>
          </div>
        )}
      </main>
      <EquipmentModal
        open={equipModalOpen}
        onOpenChange={setEquipModalOpen}
        initialEquip={editingEquip}
        onSave={handleSaveEquip}
      />
      <XinfaModal
        open={xinfaModalOpen}
        onOpenChange={setXinfaModalOpen}
        currentClass={currentClass}
        currentLoadout={xinfaLoadout}
        slotIndex={xinfaIndex}
        onSelect={(name) => {
          const next = [...xinfaLoadout];
          next[xinfaIndex] = name;
          setXinfaLoadout(currentAccount, next);
        }}
      />
      <GraduationModal
        open={gradModalOpen}
        onOpenChange={setGradModalOpen}
        db={db}
        equippedItems={equippedItems}
        currentClass={currentClass}
        bowType={bowType}
        setType={setType}
        xinfaLoadout={xinfaLoadout}
        earlySeasonBonus={earlySeasonBonus}
        onApplyBuild={applyBuild}
      />
      <ImportExportModal
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        accountName={currentAccount}
        equipData={db}
        onImport={(items) => {
          if (!currentAccount) return;
          replaceAll(currentAccount, items);
          hydrateForAccount(currentAccount, items);
          setImportExportOpen(false);
        }}
      />
    </div>
  );
}
