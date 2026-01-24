'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { CommonData } from "../lib/data/commonData";
import { ClassConfig } from "../lib/data/classConfig";
import type { EquipItem, EquippedItems } from "../lib/types";
import { Calculator } from "../lib/calculator";
import { buildStatsDisplay } from "../lib/statsDisplay";
import {
  clearAccountData,
  loadEquipData,
  loadRightPanelState,
  saveRightPanelState,
} from "../lib/storage";
import { EquipmentModal } from "../components/modals/EquipmentModal";
import { XinfaModal } from "../components/modals/XinfaModal";
import { GraduationModal } from "../components/modals/GraduationModal";
import { ImportExportModal } from "../components/modals/ImportExportModal";
import { useAccountStore } from "../stores/accountStore";
import { useEquipmentStore } from "../stores/equipmentStore";
import { useSimulationStore } from "../stores/simulationStore";

const SLOT_LABELS: Record<keyof EquippedItems, string> = {
  weapon1: "武器1",
  weapon2: "武器2",
  head: "冠胄",
  chest: "胸甲",
  ring: "环",
  pendant: "佩",
  legs: "胫甲",
  hands: "腕甲",
};

const bowOptions = [
  { value: "precision", label: "精准弓" },
  { value: "crit", label: "会心弓" },
  { value: "intent", label: "会意弓" },
];

const formatDisplayTotals = (totals: Record<string, number>) => {
  const displayTotals: Record<string, number> = { ...totals };
  for (const key in displayTotals) {
    const val = Number(displayTotals[key]) || 0;
    const isPercent =
      CommonData.PERCENT_STATS.includes(key) ||
      key.includes("率") ||
      key.includes("增效") ||
      key.includes("加成") ||
      key.includes("增伤") ||
      key.includes("穿透");
    displayTotals[key] = isPercent ? parseFloat(val.toFixed(1)) : Math.round(val);
  }
  return displayTotals;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [createName, setCreateName] = useState("");
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

  const { accounts, currentAccount, hydrated, hydrate, createAccount, deleteAccount, setCurrentAccount } =
    useAccountStore();
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
  }, [currentAccount, equippedItems, currentClass, bowType, xinfaLoadout, setType, earlySeasonBonus]);

  const rotationConfig = ClassConfig.ROTATIONS[currentClass];
  const rotation = rotationConfig?.rotation || [];
  const baseline = rotationConfig?.baseline || 4244078.34;
  const useTime = rotationConfig?.useTime || 1;
  const skillDb = rotationConfig?.skillDatabase || {};

  const graduationInfo = useMemo(() => {
    if (!totals || rotation.length === 0) return null;
    const accParams = { ...totals, 套装: setType, 心法: xinfaLoadout, 当前流派: currentClass };
    const accResult = Calculator.calculateGraduationRate(accParams, skillDb, rotation, baseline, false);
    const displayTotals = formatDisplayTotals(totals);
    const excelParams = { ...displayTotals, 套装: setType, 心法: xinfaLoadout, 当前流派: currentClass };
    const excelResult = Calculator.calculateGraduationRate(excelParams, skillDb, rotation, baseline, false);
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
    if (success) setCreateName("");
  };

  const handleDeleteAccount = () => {
    if (!currentAccount) return;
    if (!window.confirm("确定删除当前角色？")) return;
    clearAccountData(currentAccount);
    deleteAccount(currentAccount);
  };

  const handleSaveEquip = (equip: EquipItem, isNew: boolean) => {
    if (!currentAccount) return;
    if (isNew) {
      addEquip(currentAccount, equip);
      if (equip.slotId === "1") {
        if (!equippedItems.weapon1) equipSlot(currentAccount, "weapon1", equip);
        else if (!equippedItems.weapon2) equipSlot(currentAccount, "weapon2", equip);
      } else {
        const slotKeyMap: Record<string, keyof EquippedItems> = {
          "3": "ring",
          "4": "pendant",
          "5": "head",
          "6": "chest",
          "7": "legs",
          "8": "hands",
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
    if (!window.confirm("删除后无法恢复，确定？")) return;
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
      if (typeof equipId === "string" && equipId.includes("_chengyin")) {
        equipId = equipId.replace("_chengyin", "");
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
    if (item.slotId === "1") {
      const allowed = ClassConfig.WEAPON_RULES[currentClass] || [];
      if (!allowed.includes(item.weaponTypeId || "")) {
        alert("当前流派无法装备此类型的武器");
        return;
      }
      const w1 = equippedItems.weapon1;
      const w2 = equippedItems.weapon2;
      if (w1 && w1.weaponTypeId === item.weaponTypeId) {
        equipSlot(currentAccount, "weapon1", item);
      } else if (w2 && w2.weaponTypeId === item.weaponTypeId) {
        equipSlot(currentAccount, "weapon2", item);
      } else {
        if (!w1) equipSlot(currentAccount, "weapon1", item);
        else if (!w2) equipSlot(currentAccount, "weapon2", item);
        else equipSlot(currentAccount, "weapon1", item);
      }
      return;
    }
    const slotKeyMap: Record<string, keyof EquippedItems> = {
      "3": "ring",
      "4": "pendant",
      "5": "head",
      "6": "chest",
      "7": "legs",
      "8": "hands",
    };
    const slotKey = slotKeyMap[item.slotId];
    if (slotKey) equipSlot(currentAccount, slotKey, item);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur h-14" />
        <main className="flex-1 container max-w-screen-2xl mx-auto p-4">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        </main>
      </div>
    );
  }

  const toggleRightPanel = (key: "simulation" | "graduation" | "stats") => {
    setRightPanels((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveRightPanelState(currentAccount, next);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container max-w-screen-2xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="font-semibold tracking-tight">燕云十六声装备毕业率管理器</div>
          <div className="flex items-center gap-2">
            <Select
              value={currentAccount ?? ""}
              onValueChange={(value) => setCurrentAccount(value || null)}
            >
              <SelectTrigger className="w-[200px] cursor-pointer">
                <SelectValue placeholder="-- 请选择/添加角色 --" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <input
                className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="新建角色名称"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
              />
              <Button className="cursor-pointer" onClick={handleCreateAccount}>+ 新建角色</Button>
              <Button variant="secondary" className="cursor-pointer" onClick={handleDeleteAccount} disabled={!currentAccount}>
                删除
              </Button>
              <Button variant="outline" className="cursor-pointer" onClick={() => setImportExportOpen(true)} disabled={!currentAccount}>
                导出/导入数据
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-screen-2xl mx-auto p-4 min-h-[calc(100vh-56px)] h-[calc(100vh-56px)]">
        {!currentAccount ? (
          <Card className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-xl font-semibold mb-2">欢迎使用燕云十六声装备毕业率管理器</h2>
            <p className="text-muted-foreground">
              请在顶部创建或选择角色后开始录入装备与模拟。
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch h-full">
            <section className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">装备库</h3>
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingEquip(null);
                      setEquipModalOpen(true);
                    }}
                  >
                    录入装备
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    variant={filter === "all" ? "default" : "secondary"}
                    onClick={() => setFilter("all")}
                  >
                    全部
                  </Button>
                  {CommonData.SLOTS.map((slot) => (
                    <Button
                      key={slot.id}
                      size="sm"
                      className="cursor-pointer"
                      variant={filter === slot.id ? "default" : "secondary"}
                      onClick={() => setFilter(slot.id)}
                    >
                      {slot.name}
                    </Button>
                  ))}
                </div>
              </Card>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {db.length === 0 ? (
                  <Card className="col-span-full p-8 text-center text-muted-foreground">
                    当前数据库无装备，请点击右上角录入装备按钮。
                  </Card>
                ) : (
                  db
                    .filter((item) => (filter === "all" ? true : item.slotId === filter))
                    .map((equip) => {
                      const isEquipped = Object.values(equippedItems).some(
                        (item) => item && item.id === equip.id
                      );
                      return (
                        <Card
                          key={equip.id}
                          className={`p-4 transition cursor-pointer ${
                            isEquipped ? "border-yellow-400 ring-1 ring-yellow-400/40" : "hover:border-primary/50"
                          }`}
                          onClick={() => equipItemById(equip.id)}
                        >
                        <div className="flex justify-end gap-1 -mt-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
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
                            className="h-7 w-7 text-destructive"
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
                            className="rounded-md border border-border/60"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{equip.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {equip.slotName} {equip.isChengyin ? "(承音)" : ""}
                            </div>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>{equip.mainStat.type}</span>
                            <span>
                              +{equip.mainStat.value}
                              {equip.mainStat.isPercent ? "%" : ""}
                            </span>
                          </div>
                          {equip.subStats.map((sub, idx) => (
                            <div key={`${equip.id}-sub-${idx}`} className="flex justify-between text-muted-foreground">
                              <span>· {sub.type}</span>
                              <span>
                                +{sub.value}
                                {sub.isPercent ? "%" : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                        </Card>
                      );
                    })
                )}
              </div>
            </section>

            <section className="flex flex-col gap-2 h-full min-h-[calc(100vh-120px)] overflow-hidden">
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">穿戴模拟</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      className="cursor-pointer"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setXinfaIndex(0);
                        setXinfaModalOpen(true);
                      }}
                    >
                      更换心法
                    </Button>
                    <Button
                      className="cursor-pointer"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRightPanel("simulation")}
                    >
                      {rightPanels.simulation ? "折叠" : "展开"}
                    </Button>
                  </div>
                </div>
                {rightPanels.simulation ? (
                  <div className="space-y-3 mt-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">流派</label>
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
                        <label className="text-xs text-muted-foreground">弓诀</label>
                        <Select value={bowType} onValueChange={(value) => setBowType(currentAccount, value)}>
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
                        <label className="text-xs text-muted-foreground">套装</label>
                        <Select value={setType} onValueChange={(value) => setSetType(currentAccount, value)}>
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
                      {(["weapon1", "weapon2", "head", "chest", "ring", "pendant", "legs", "hands"] as Array<
                        keyof EquippedItems
                      >).map((slotKey) => {
                        const item = equippedItems[slotKey];
                        return (
                          <Card key={slotKey} className="p-2 flex items-center gap-2">
                            <div className="h-10 w-10 rounded-md border border-border/60 flex items-center justify-center overflow-hidden">
                              {item ? (
                                <Image src={`/${item.icon}`} alt={item.name} width={40} height={40} />
                              ) : (
                                <span className="text-xs text-muted-foreground">{SLOT_LABELS[slotKey]}</span>
                              )}
                            </div>
                            <div className="text-xs">
                              <div className="font-medium">{SLOT_LABELS[slotKey]}</div>
                              <div className="text-muted-foreground">{item ? item.name : "未穿戴"}</div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">心法配置</div>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, idx) => {
                          const name = xinfaLoadout[idx] || "";
                          const lockedList = ClassConfig.XINFA_LOCKED[currentClass] || [];
                          const isLocked = name && lockedList.includes(name);
                          return (
                            <button
                              key={`xinfa-${idx}`}
                              className={`rounded-lg border p-2 text-xs  ${
                                isLocked
                                  ? "border-dashed border-muted-foreground/60 text-muted-foreground bg-muted/10 cursor-not-allowed"
                                  : "border-border/60 cursor-pointer"
                              }`}
                              onClick={() => {
                                if (isLocked) return;
                                setXinfaIndex(idx);
                                setXinfaModalOpen(true);
                              }}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <div className={`h-10 w-10 rounded-md border flex items-center justify-center overflow-hidden ${
                                  isLocked ? "border-muted-foreground/40" : "border-border/60"
                                }`}>
                                  {name ? (
                                    <Image src={`/icon/${name}.jpg`} alt={name} width={40} height={40} />
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">空</span>
                                  )}
                                </div>
                                <span>{name || "点击选择"}</span>
                                {isLocked ? <span className="text-[10px]">不可变更</span> : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">当前毕业率</h3>
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRightPanel("graduation")}
                  >
                    {rightPanels.graduation ? "折叠" : "展开"}
                  </Button>
                </div>
                {rightPanels.graduation ? (
                  <div className="space-y-2 mt-3">
                    {rotation.length === 0 || !graduationInfo ? (
                      <div className="text-muted-foreground text-sm">
                        毕业率表格未配置，请等待更新
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-3xl font-semibold text-yellow-300">
                          {graduationInfo.accurate}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          excel表格显示：{graduationInfo.excel}
                        </div>
                        <div className="text-sm text-muted-foreground">轴期望秒伤：{graduationInfo.dps}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={earlySeasonBonus}
                        onCheckedChange={(value) => setEarlySeasonBonus(currentAccount, Boolean(value))}
                      />
                      <span className="text-xs text-muted-foreground">提前获得下半赛季属性（毕业率将虚高）</span>
                    </div>
                    <Button className="w-full cursor-pointer" onClick={() => setGradModalOpen(true)}>
                      毕业率分析
                    </Button>
                  </div>
                ) : null}
              </Card>

              <Card
                className={`p-3 ${rightPanels.stats ? "flex-1 overflow-y-auto" : "overflow-hidden"}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">面板属性</h3>
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRightPanel("stats")}
                  >
                    {rightPanels.stats ? "折叠" : "展开"}
                  </Button>
                </div>
                {rightPanels.stats ? (
                  <div className="space-y-2 mt-3">
                    {statDisplay.length === 0 ? (
                      <div className="text-muted-foreground text-sm">暂无面板属性</div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        {statDisplay.map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span>{item.value}</span>
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
