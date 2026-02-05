'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { EquipmentLibrary } from '@/components/equipment';
import { AppHeader, GraduationRatePanel, WelcomeCard } from '@/components/layout';
import { EquipmentModal } from '@/components/modals/EquipmentModal';
import { GraduationModal } from '@/components/modals/GraduationModal';
import { ImportExportModal } from '@/components/modals/ImportExportModal';
import { ReportModal } from '@/components/modals/ReportModal';
import { XinfaModal } from '@/components/modals/XinfaModal';
import { SimulationPanel } from '@/components/simulation';
import { StatsPanel } from '@/components/stats';
import { Calculator } from '@/lib/calculator';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import { addFullDingyinToEquips } from '@/lib/graduation/dingyin';
import { buildStatsDisplay } from '@/lib/statsDisplay';
import {
  clearAccountData,
  loadEquipData,
  loadRightPanelState,
  saveRightPanelState,
} from '@/lib/storage';
import type { EquipItem, EquippedItems } from '@/lib/types';
import { useAccountStore } from '@/stores/accountStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';

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
  const [reportOpen, setReportOpen] = useState(false);
  const [rightPanels, setRightPanels] = useState({
    simulation: true,
    graduation: true,
    stats: true,
  });

  const t = useTranslations();

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
    loanDingyin,
    equippedItems,
    hydrateForAccount,
    setCurrentClass,
    setBowType,
    setSetType,
    setXinfaLoadout,
    setEarlySeasonBonus,
    setLoanDingyin,
    equipSlot,
    updateEquipsById,
  } = useSimulationStore();

  // Hydration effects
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

  // Calculations
  const effectiveEquippedItems = useMemo(() => {
    if (!loanDingyin) return equippedItems;
    return addFullDingyinToEquips(equippedItems);
  }, [equippedItems, loanDingyin]);

  const totals = useMemo(() => {
    if (!currentAccount) return null;
    return Calculator.calculateTotal(
      effectiveEquippedItems,
      currentClass,
      bowType,
      xinfaLoadout,
      setType,
      false,
      null,
      earlySeasonBonus
    );
  }, [currentAccount, effectiveEquippedItems, currentClass, bowType, xinfaLoadout, setType, earlySeasonBonus]);

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
    return { accurate: accResult.graduationRate, excel: excelResult.graduationRate, dps, isLoaned: loanDingyin };
  }, [totals, rotation, setType, xinfaLoadout, currentClass, skillDb, baseline, useTime, loanDingyin]);

  const statDisplay = useMemo(() => {
    if (!totals) return [];
    return buildStatsDisplay(formatDisplayTotals(totals), currentClass, setType, loanDingyin, earlySeasonBonus);
  }, [totals, currentClass, setType, loanDingyin, earlySeasonBonus]);

  // Handlers
  const handleCreateAccount = () => {
    const success = createAccount(createName);
    if (success) setCreateName('');
  };

  const handleDeleteAccount = () => {
    if (!currentAccount) return;
    if (!window.confirm(t('deleteConfirm.character'))) return;
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
          '3': 'ring', '4': 'pendant', '5': 'head', '6': 'chest', '7': 'legs', '8': 'hands',
        };
        const slotKey = slotKeyMap[equip.slotId];
        if (slotKey && !equippedItems[slotKey]) equipSlot(currentAccount, slotKey, equip);
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
    if (!window.confirm(t('equipment.deleteConfirm'))) return;
    deleteEquip(currentAccount, equipId);
    (Object.keys(equippedItems) as Array<keyof EquippedItems>).forEach((slotKey) => {
      const item = equippedItems[slotKey];
      if (item && item.id === equipId) equipSlot(currentAccount, slotKey, null);
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
        found = db.find((item) => item.name === equip.name && item.slotId === equip.slotId);
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
        alert(t('equipment.cannotEquipWeapon'));
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
      '3': 'ring', '4': 'pendant', '5': 'head', '6': 'chest', '7': 'legs', '8': 'hands',
    };
    const slotKey = slotKeyMap[item.slotId];
    if (slotKey) equipSlot(currentAccount, slotKey, item);
  };

  const toggleRightPanel = (key: 'simulation' | 'graduation' | 'stats') => {
    setRightPanels((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveRightPanelState(currentAccount, next);
      return next;
    });
  };

  // Loading state
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="border-border/40 bg-background/95 sticky top-0 z-50 h-14 w-full border-b backdrop-blur" />
        <main className="container mx-auto max-w-screen-2xl flex-1 p-4">
          <div className="flex h-[60vh] items-center justify-center">
            <div className="text-muted-foreground">{t('common.loading')}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        accounts={accounts}
        currentAccount={currentAccount}
        createName={createName}
        onCreateNameChange={setCreateName}
        onAccountChange={setCurrentAccount}
        onCreateAccount={handleCreateAccount}
        onDeleteAccount={handleDeleteAccount}
        onImportExport={() => setImportExportOpen(true)}
        onGenerateReport={() => setReportOpen(true)}
      />

      <main className="container mx-auto max-w-screen-2xl flex-1 p-2 sm:p-4">
        {!currentAccount ? (
          <WelcomeCard />
        ) : (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.1fr_0.4fr] lg:items-start lg:gap-6">
            {/* Left: Equipment Library */}
            <EquipmentLibrary
              db={db}
              equippedItems={equippedItems}
              filter={filter}
              onFilterChange={setFilter}
              onAddEquip={() => {
                setEditingEquip(null);
                setEquipModalOpen(true);
              }}
              onEditEquip={(equip) => {
                setEditingEquip(equip);
                setEquipModalOpen(true);
              }}
              onDeleteEquip={handleDeleteEquip}
              onEquipItem={equipItemById}
            />

            {/* Right: Simulation, Graduation, Stats panels - 在移动端显示在装备库前面 */}
            <section className="flex flex-col gap-3 order-first lg:order-none">
              <SimulationPanel
                expanded={rightPanels.simulation}
                onToggle={() => toggleRightPanel('simulation')}
                currentClass={currentClass}
                bowType={bowType}
                setType={setType}
                equippedItems={equippedItems}
                xinfaLoadout={xinfaLoadout}
                onClassChange={(value) => setCurrentClass(currentAccount, value, db)}
                onBowChange={(value) => setBowType(currentAccount, value)}
                onSetChange={(value) => setSetType(currentAccount, value)}
                onXinfaClick={(idx) => {
                  setXinfaIndex(idx);
                  setXinfaModalOpen(true);
                }}
                onUnequip={(slotKey) => equipSlot(currentAccount, slotKey, null)}
              />

              <GraduationRatePanel
                graduationInfo={graduationInfo}
                hasRotation={rotation.length > 0}
                earlySeasonBonus={earlySeasonBonus}
                loanDingyin={loanDingyin}
                onEarlySeasonChange={(value) => setEarlySeasonBonus(currentAccount, value)}
                onLoanDingyinChange={(value) => setLoanDingyin(currentAccount, value)}
                onAnalyze={() => setGradModalOpen(true)}
                expanded={rightPanels.graduation}
                onToggle={() => toggleRightPanel('graduation')}
              />

              <StatsPanel
                statDisplay={statDisplay}
                expanded={rightPanels.stats}
                onToggle={() => toggleRightPanel('stats')}
              />
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
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

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        accountName={currentAccount}
        currentClass={currentClass}
        setType={setType}
        xinfaLoadout={xinfaLoadout}
        graduationInfo={graduationInfo}
        statDisplay={statDisplay}
        earlySeasonBonus={earlySeasonBonus}
        loanDingyin={loanDingyin}
      />
    </div>
  );
}
 