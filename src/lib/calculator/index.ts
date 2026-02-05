import { ClassConfig } from '../data/classConfig';
import { CommonData } from '../data/commonData';
import type {
  CalculatorStatModifier,
  EquippedItems,
  GraduationRateResult,
  SkillDataEntry,
} from '../types';

type SkillDb = Record<string, SkillDataEntry>;

interface RotationCache {
  skillTimeline: Array<{
    name: string;
    count: number;
    isDingyin: boolean;
    generalBonus: number;
    included: boolean;
    yishui: number;
    yongquan?: 'TRUE' | 'FALSE';
  }>;
  skillDb: SkillDb;
  baseline: number;
  currentClass: string;
  setName: string;
  xinfaList: string[] | string;
  checkXinfa: (name: string) => boolean;
  hasSuoHen: boolean;
  hasDuanShi: boolean;
  hasYiShui: boolean;
  bossDef: number;
  weaponBonusMap: Record<string, number>;
}

export const Calculator = {
  _rotationCache: null as RotationCache | null,
  _cacheKey: null as string | null,

  clearCache() {
    this._rotationCache = null;
    this._cacheKey = null;
  },

  _getCacheKey(
    currentClass: string,
    xinfaList: string[] | string,
    setName: string,
    rotation: RotationCache['skillTimeline'],
    skillDb: SkillDb,
    baseline: number
  ) {
    const xinfaStr = Array.isArray(xinfaList) ? [...xinfaList].sort().join(',') : xinfaList;
    return `${currentClass}_${xinfaStr}_${setName}_${rotation.length}_${baseline}_${
      Object.keys(skillDb).length
    }`;
  },

  calculateTotal(
    equippedItems: EquippedItems,
    currentClass: string,
    bowType: string,
    xinfaList: string[],
    setType: string,
    debug = false,
    statModifier: CalculatorStatModifier | null = null,
    earlySeasonBonus = false
  ) {
    let total = JSON.parse(JSON.stringify(CommonData.BASE_STATS));
    let baseSanWei = CommonData.BASE_STATS['Agility'];

    if (debug) {
      console.groupCollapsed(`📊 MianBanJiSuanLiuCheng (LiuPai: ${currentClass || 'WeiXuanZe'})`);
      console.log('1. ChuShiJiChuMianBan:', JSON.parse(JSON.stringify(total)));
    }

    if (currentClass) {
      const prefix = currentClass.substring(0, 2);
      if (['MingJin', 'LieShi', 'QianSi', 'PoZhu'].includes(prefix)) {
        const minKey = `ZuiXiao${prefix}GongJi`;
        const maxKey = `ZuiDa${prefix}GongJi`;
        const damageKey = `${prefix}ShangHaiJiaCheng`;

        total[minKey] = (total[minKey] || 0) + 360.0;
        total[maxKey] = (total[maxKey] || 0) + 721.0;
        total[damageKey] = (total[damageKey] || 0) + 11.8;
      }
    }

    if (debug) {
      console.group('2. EquipmentJiaChengMingXi');
    }

    Object.values(equippedItems).forEach((equip) => {
      if (!equip) return;

      const equipLog: { name: string; adds: Record<string, number> } = {
        name: equip.name,
        adds: {},
      };
      const track = (k: string, v: number) => {
        if (v) equipLog.adds[k] = (equipLog.adds[k] || 0) + v;
      };

      if (equip.slotId === '1') {
        let minAdd = 0;
        let maxAdd = 0;
        if (equip.isPurple) {
          minAdd = 68;
          maxAdd = 158;
        } else {
          minAdd = 75;
          maxAdd = 175;
        }
        total['Min Outer Attack'] = (total['Min Outer Attack'] || 0) + minAdd;
        total['Max Outer Attack'] = (total['Max Outer Attack'] || 0) + maxAdd;
        track('Min Outer Attack(BaiZhi)', minAdd);
        track('Max Outer Attack(BaiZhi)', maxAdd);
      } else if (equip.slotId === '3') {
        const val = equip.isPurple ? 90 : 100;
        total['Min Outer Attack'] = (total['Min Outer Attack'] || 0) + val;
        track('Min Outer Attack(BaiZhi)', val);
      } else if (equip.slotId === '4') {
        const val = equip.isPurple ? 135 : 150;
        total['Max Outer Attack'] = (total['Max Outer Attack'] || 0) + val;
        track('Max Outer Attack(BaiZhi)', val);
      }

      if (
        equip.mainStat &&
        equip.mainStat.type !== 'ShengCunLeiAffix' &&
        equip.mainStat.type !== 'ShengCunXiang'
      ) {
        this.addStatWithTrack(total, equip.mainStat, track);
      }
      if (equip.dingyinStat) this.addStatWithTrack(total, equip.dingyinStat, track);
      equip.subStats.forEach((sub: { type: string; value: number }) => {
        if (sub.type !== 'ShengCunLeiAffix' && sub.type !== 'ShengCunXiang') {
          this.addStatWithTrack(total, sub, track);
        }
      });
      if (debug) {
        console.log(`- [${equip.slotName}] ${equip.name}:`, equipLog.adds);
      }
    });
    if (debug) {
      console.log('CiShiMianBanShuXing:', JSON.parse(JSON.stringify(total)));
      console.groupEnd();
    }

    if (debug) {
      console.group('3. Inner WayJiaChengMingXi');
    }
    if (xinfaList && Array.isArray(xinfaList)) {
      xinfaList.forEach((xinfaName) => {
        const stats = CommonData.XINFA_DATA[xinfaName];
        if (stats) {
          for (const [k, v] of Object.entries(stats)) {
            total[k] = (total[k] || 0) + v;
            if (debug) console.log(`- [${xinfaName}] ${k}:`, v);
          }
        }
      });
    }
    if (debug) {
      console.groupEnd();
    }
    if (debug) {
      console.group('4. SetJiaChengMingXi');
    }
    if (setType && CommonData.SET_DATA[setType]) {
      const setStats = CommonData.SET_DATA[setType];
      for (const [key, val] of Object.entries(setStats)) {
        total[key] = (total[key] || 0) + val;
        if (debug) console.log(`- [${setType}] ${key}:`, val);
      }
    }
    if (debug) {
      console.groupEnd();
    }

    if (debug) {
      console.group('5. AffixXiuGaiQiJiaChengMingXi');
    }
    if (
      statModifier &&
      statModifier.type &&
      statModifier.type !== 'ShengCunLeiAffix' &&
      statModifier.type !== 'ShengCunXiang'
    ) {
      const modifierValue = parseFloat(String(statModifier.value)) || 0;
      if (statModifier.operation === 'add') {
        total[statModifier.type] = (total[statModifier.type] || 0) + modifierValue;
        if (debug) console.log(`- [${statModifier.type}] ${statModifier.value}:`, modifierValue);
      } else if (statModifier.operation === 'remove') {
        total[statModifier.type] = (total[statModifier.type] || 0) - modifierValue;
        if (debug) console.log(`- [${statModifier.type}] ${statModifier.value}:`, modifierValue);
        if (total[statModifier.type] < 0) {
          total[statModifier.type] = 0;
        }
        if (
          statModifier.type === 'Strength' ||
          statModifier.type === 'Agility' ||
          statModifier.type === 'Momentum'
        ) {
          if (total[statModifier.type] < baseSanWei) {
            total[statModifier.type] = baseSanWei;
          }
        }
      }
    }
    if (debug) {
      console.groupEnd();
    }
    if (debug) {
      console.group('6. TiQianHuoDeXiaBanSaiJiShuXingJiaChengMingXi');
    }
    if (earlySeasonBonus) {
      total['Strength'] += 14;
      total['Agility'] += 14;
      total['Momentum'] += 14;
    }

    const totalJing = total['Strength'] || 0;
    const totalMin = total['Agility'] || 0;
    const totalShi = total['Momentum'] || 0;
    const extraJing = Math.max(0, totalJing - baseSanWei);
    const extraMin = Math.max(0, totalMin - baseSanWei);
    const extraShi = Math.max(0, totalShi - baseSanWei);

    if (earlySeasonBonus) {
      baseSanWei += 14;
      total['Accuracy'] = (total['Accuracy'] || 0) + 1.4;
      if (debug) console.log(`- [TiQianHuoDeXiaBanSaiJiShuXing] Strength: 14, Agility: 14, Momentum: 14，Accuracy: 1.4`);
    }
    if (debug) {
      console.groupEnd();
    }
    if (debug) {
      console.group('7. ShuXingZhuanHuaMingXi');
    }
    total['Min Outer Attack'] += extraJing * 0.22 + extraMin * 0.9;
    if (debug) console.log(`- [ShuXingZhuanHua] Min Outer Attack: ${extraJing * 0.22 + extraMin * 0.9}`);
    total['Max Outer Attack'] += extraJing * 1.36 + extraShi * 0.9;
    if (debug) console.log(`- [ShuXingZhuanHua] Max Outer Attack: ${extraJing * 1.36 + extraShi * 0.9}`);
    total['Crit Rate'] += extraMin * 0.076;
    if (debug) console.log(`- [ShuXingZhuanHua] Crit Rate: ${extraMin * 0.076}`);
    total['Insight Rate'] += extraShi * 0.038;
    if (debug) console.log(`- [ShuXingZhuanHua] Insight Rate: ${extraShi * 0.038}`);
    if (currentClass === 'MingJinHong') {
      const effectiveShi = Math.min(totalShi, 300);
      total['Insight Rate'] += effectiveShi * 0.015;
      total['Max Outer Attack'] += effectiveShi * 0.264;
      if (debug) console.log(`- [MingJinHongShuXingZhuanHua] Max Outer Attack: ${effectiveShi * 0.264}`);
      if (debug) console.log(`- [MingJinHongShuXingZhuanHua] Insight Rate: ${effectiveShi * 0.015}`);
    }
    if (
      currentClass === 'PoZhuYuan' ||
      currentClass === 'PoZhuChen' ||
      currentClass === 'PoZhuFeng' ||
      currentClass === 'QianSiYu' ||
      currentClass === 'QianSiLin' ||
      currentClass === 'LieShiJun（ShuangQie）' ||
      currentClass === 'LieShiJun（ChunTang）'
    ) {
      const effectiveMin = Math.min(totalMin, 300);
      total['Crit Rate'] += effectiveMin * 0.03;
      total['Min Outer Attack'] += effectiveMin * 0.264;
      if (debug) console.log(`- [HuiXinZhiYeShuXingZhuanHua] Min Outer Attack: ${effectiveMin * 0.264}`);
      if (debug) console.log(`- [HuiXinZhiYeShuXingZhuanHua] Crit Rate: ${effectiveMin * 0.03}`);
    }
    if (currentClass === 'LieShiWei') {
      const effectiveJing = Math.min(totalJing, 300);
      total['Crit Rate'] += effectiveJing * 0.03;
      if (debug) console.log(`- [LieShiWeiShuXingZhuanHua] Crit Rate: ${effectiveJing * 0.03}`);
    }
    if (currentClass === 'MingJinYing') {
      const effectiveJing = Math.min(totalJing, 300);
      total['Insight Rate'] += effectiveJing * 0.015;
      total['Max Outer Attack'] += effectiveJing * 0.264;
      if (debug) console.log(`- [MingJinYingShuXingZhuanHua] Max Outer Attack: ${effectiveJing * 0.264}`);
      if (debug) console.log(`- [MingJinYingShuXingZhuanHua] Insight Rate: ${effectiveJing * 0.015}`);
    }

    if (bowType === 'precision') total['Accuracy'] = (total['Accuracy'] || 0) + 4.7;
    else if (bowType === 'crit') total['Crit Rate'] = (total['Crit Rate'] || 0) + 5.2;
    else if (bowType === 'intent') total['Insight Rate'] = (total['Insight Rate'] || 0) + 2.6;
    if (debug) {
      console.log(
        `- [GongLeiShuXingZhuanHua] Accuracy: ${bowType === 'precision' ? 4.7 : bowType === 'crit' ? 5.2 : 2.6}`
      );
      console.groupEnd();
    }
    if (debug) {
      console.group('8. ShiJiZhiHeYiChuZhiMingXi');
    }
    const rawCrit = total['Crit Rate'] / 1.85;
    let exCrit = 0;
    if (currentClass === 'LieShiWei') exCrit += 24;
    if (setType === 'HuanHua') exCrit += 5;

    let finalCrit = rawCrit + exCrit;
    let critOverflow = 0;
    if (finalCrit > 80) {
      critOverflow = (finalCrit - 80) * 1.85;
      finalCrit -= exCrit;
      if (finalCrit > 80) finalCrit = 80;
    } else if (exCrit !== 0) {
      finalCrit -= exCrit;
    }
    total['ShiJiHuiXinL'] = finalCrit;
    total['HuiXinLYiChu'] = critOverflow;
    if (debug) console.log(`- [ShiJiHuiXinL] ${finalCrit}`);
    if (debug) console.log(`- [HuiXinLYiChu] ${critOverflow}`);

    const rawIntent = total['Insight Rate'] / 1.85;
    let finalIntent = rawIntent;
    let intentOverflow = 0;
    if (finalIntent > 40) {
      intentOverflow = (finalIntent - 40) * 1.85;
      finalIntent = 40;
    }
    total['ShiJiHuiYiL'] = finalIntent;
    total['HuiYiLYiChu'] = intentOverflow;
    if (debug) console.log(`- [ShiJiHuiYiL] ${finalIntent}`);
    if (debug) console.log(`- [HuiYiLYiChu] ${intentOverflow}`);

    const rawAcc = (total['Accuracy'] - 65.065) / 1.85 + 65.065;
    let finalAcc = rawAcc;
    let accOverflow = 0;
    if (finalAcc > 100) {
      accOverflow = (finalAcc - 100) * 1.85;
      finalAcc = 100;
    }
    total['ShiJiJingZhunL'] = finalAcc;
    total['JingZhunLYiChu'] = accOverflow;
    if (debug) console.log(`- [ShiJiJingZhunL] ${finalAcc}`);
    if (debug) console.log(`- [JingZhunLYiChu] ${accOverflow}`);
    if (
      finalIntent +
        (finalCrit + exCrit > 80 ? 80 : finalCrit + exCrit) +
        total['Direct Crit Rate'] +
        total['Direct Insight Rate'] >
      100
    ) {
      const overflow =
        (finalIntent +
          (finalCrit + exCrit > 80 ? 80 : finalCrit + exCrit) +
          total['Direct Crit Rate'] +
          total['Direct Insight Rate'] -
          100) *
        1.85;
      total['HuiXinLYiChu'] += overflow;
      if (debug) console.log(`- [HuiXinLYiChu] EWaiYiChu: ${overflow}`);
    }
    if (debug) {
      console.log('CiShiMingXi:', JSON.parse(JSON.stringify(total)));
      console.groupEnd();
    }

    delete total['Strength'];
    delete total['Agility'];
    delete total['Momentum'];
    // BaoLiuBaiZhiGongXianShiShiYong
    total['JingZhunLBaiZhi'] = total['Accuracy'];
    total['HuiXinLBaiZhi'] = total['Crit Rate'];
    total['HuiYiLBaiZhi'] = total['Insight Rate'];
    delete total['Accuracy'];
    delete total['Crit Rate'];
    delete total['Insight Rate'];

    return total;
  },

  calculateGraduationRate(
    params: Record<string, number | string | string[]>,
    skillDb: SkillDb,
    rotation: RotationCache['skillTimeline'],
    baseline: number,
    debug = false
  ): GraduationRateResult {
    if (debug) {
      console.groupCollapsed('🧮 Graduation RateJiSuanXiangQing (DianJiZhanKai)');
    }

    const currentClass = (params['DangQianLiuPai'] || params['currentClass'] || '') as string;
    const xinfaList = (params['Inner Way'] || []) as string[] | string;
    const setName = (params['Set'] || '') as string;

    const cacheKey = this._getCacheKey(
      currentClass,
      xinfaList,
      setName,
      rotation,
      skillDb,
      baseline
    );
    const useCache = this._rotationCache && this._cacheKey === cacheKey;

    const getVal = (key: string) => parseFloat(String(params[key])) || 0;

    const maxAtks = {
      PoZhu: getVal('Max Po Zhu Attack'),
      MingJin: getVal('Max Mingjin Attack'),
      LieShi: getVal('Max Lie Shi Attack'),
      QianSi: getVal('Max Qian Si Attack'),
      NoneXiang: getVal('ZuiDaNoneXiangGongJi'),
    };
    let mainElement = 'None';
    let highestAtk = -1;
    for (const [ele, val] of Object.entries(maxAtks)) {
      if (val > highestAtk) {
        highestAtk = val;
        mainElement = ele;
      }
    }
    const genPen = getVal('Elemental Penetration');
    const genDmg = getVal('Elemental Damage Bonus');

    const rawStats = {
      minOuter: getVal('Min Outer Attack'),
      maxOuter: getVal('Max Outer Attack'),
      outerPen: getVal('Outer Penetration'),
      minPoZhu: getVal('Min Po Zhu Attack'),
      maxPoZhu: getVal('Max Po Zhu Attack'),
      poZhuPen: getVal('Po Zhu Penetration') + (mainElement === 'PoZhu' ? genPen : 0),
      minMingJin: getVal('Min Mingjin Attack'),
      maxMingJin: getVal('Max Mingjin Attack'),
      mingJinPen: getVal('Ming Jin Penetration') + (mainElement === 'MingJin' ? genPen : 0),
      minLieShi: getVal('Min Lie Shi Attack'),
      maxLieShi: getVal('Max Lie Shi Attack'),
      lieShiPen: getVal('Lie Shi Penetration') + (mainElement === 'LieShi' ? genPen : 0),
      minQianSi: getVal('Min Qian Si Attack'),
      maxQianSi: getVal('Max Qian Si Attack'),
      qianSiPen: getVal('Qian Si Penetration') + (mainElement === 'QianSi' ? genPen : 0),
      minWuXiang: getVal('ZuiXiaoNoneXiangGongJi'),
      maxWuXiang: getVal('ZuiDaNoneXiangGongJi'),
      wuXiangPen: getVal('NoneXiang Penetration') + (mainElement === 'NoneXiang' ? genPen : 0),
      outerDmgBonus: getVal('Outer Damage Bonus'),
      poZhuDmgBonus: getVal('Pozhu Damage Bonus') + genDmg,
      mingJinDmgBonus: getVal('Mingjin Damage Bonus') + genDmg,
      lieShiDmgBonus: getVal('Lieshi Damage Bonus') + genDmg,
      qianSiDmgBonus: getVal('Qiansi Damage Bonus') + genDmg,
      precision: params['ShiJiJingZhunL'] !== undefined ? getVal('ShiJiJingZhunL') : getVal('Accuracy'),
      critRate: params['ShiJiHuiXinL'] !== undefined ? getVal('ShiJiHuiXinL') : getVal('Crit Rate'),
      intentRate: params['ShiJiHuiYiL'] !== undefined ? getVal('ShiJiHuiYiL') : getVal('Insight Rate'),
      directCrit: getVal('Direct Crit Rate'),
      directIntent: getVal('Direct Insight Rate'),
      bossDmgBonus: getVal('Boss Damage Bonus'),
      allArtsDmgBonus: getVal('All Martial Arts Effectiveness') || getVal('Quan Wu Xue Damage Bonus'),
      singleMagicBonus: getVal('Singletarget Technique Damage Bonus') || getVal('Dan Ti Qi Shu Damage Bonus'),
      groupMagicBonus: getVal('AoE Technique Damage Bonus') || getVal('Qun Ti Qi Shu Damage Bonus'),
      specificSkillBonus: getVal('Specific Skill Damage Bonus'),
      fixedDmgBonus: getVal('GuShangJiaCheng') || 0.0725,
      critDmgBonus: getVal('Crit Damage Bonus'),
      intentDmgBonus: getVal('Insight Damage Bonus'),
    };

    const weaponBonusMap: Record<string, number> = {
      Jian: getVal('Sword Martial Art Effectiveness'),
      Qiang: getVal('Spear Martial Art Effectiveness'),
      San: getVal('Umbrella Martial Art Effectiveness'),
      Shan: getVal('Fan Martial Art Effectiveness'),
      ShengBiao: getVal('Rope Dart Martial Art Effectiveness'),
      ShuangDao: getVal('Dual Blades Martial Art Effectiveness'),
      MoDao: getVal('Great Blade Martial Art Effectiveness'),
      HengDao: getVal('Sabre Martial Art Effectiveness'),
      QuanJia: getVal('Fist Martial Art Effectiveness'),
    };

    let bossDef = 498;
    const checkXinfa = (name: string) => {
      if (Array.isArray(xinfaList)) return xinfaList.includes(name);
      if (typeof xinfaList === 'string') return xinfaList.indexOf(name) > -1;
      return false;
    };
    if (currentClass === 'PoZhuChen' && (checkXinfa('DuanShiZhiGou') || checkXinfa('DaTangGe'))) {
      baseline = 4334428;
    }

    const hasSuoHen = checkXinfa('SuoHenNianNian');
    const hasDuanShi = checkXinfa('DuanShiZhiGou');
    const hasYiShui = checkXinfa('YiShuiGe');
    if (hasSuoHen) bossDef *= 0.94;

    const skillTimeline = rotation || [];

    if (!useCache) {
      this._rotationCache = {
        skillTimeline,
        skillDb,
        baseline,
        currentClass,
        setName,
        xinfaList,
        checkXinfa,
        hasSuoHen,
        hasDuanShi,
        hasYiShui,
        bossDef,
        weaponBonusMap,
      };
      this._cacheKey = cacheKey;
    }

    let totalExpectedDamage = 0;
    let settlementDamagePool = 0;

    const cache = this._rotationCache as RotationCache;
    const cachedSkillTimeline = cache.skillTimeline;
    const cachedSkillDb = cache.skillDb;
    const cachedCheckXinfa = cache.checkXinfa;
    const cachedHasSuoHen = cache.hasSuoHen;
    const cachedHasDuanShi = cache.hasDuanShi;
    const cachedHasYiShui = cache.hasYiShui;
    const cachedBossDef = cache.bossDef;
    const cachedSetName = cache.setName;
    const cachedCurrentClass = cache.currentClass;

    cachedSkillTimeline.forEach((action, idx) => {
      const skillData = cachedSkillDb ? cachedSkillDb[action.name] : null;
      if (!skillData) return;

      const calcDmg = (atk: number, ratio: number, pen: number, bonus: number, mult: number) =>
        atk * ratio * (1 + pen) * bonus * mult;

      let stats = { ...rawStats };
      if (skillData.element && skillData.element !== 'None' && skillData.element !== 'N/A') {
        const eleKeyMap: Record<string, string> = {
          PoZhu: 'PoZhu',
          MingJin: 'MingJin',
          LieShi: 'LieShi',
          QianSi: 'QianSi',
        };
        const suffix = eleKeyMap[skillData.element];
        if (suffix) {
          stats[`min${suffix}` as keyof typeof stats] += stats.minWuXiang;
          stats[`max${suffix}` as keyof typeof stats] += stats.maxWuXiang;
          stats[`${suffix.toLowerCase()}Pen` as keyof typeof stats] += stats.wuXiangPen;
        }
      }

      let effCritRate =
        stats.critRate / 100 + (skillData.exCrit || 0) + (cachedSetName === 'HuanHua' ? 5 : 0);
      if (effCritRate > 0.8) effCritRate = 0.8;
      effCritRate += stats.directCrit / 100;

      let effIntentRate = stats.intentRate / 100 + (skillData.exIntent || 0);
      if (effIntentRate > 0.4) effIntentRate = 0.4;
      effIntentRate += stats.directIntent / 100;
      if (skillData.modifiers?.['ChangFeng']) {
        effIntentRate += 0.03;
        if (cachedSetName === 'YuDou') effIntentRate += 0.075;
      }

      let effPrecision = stats.precision / 100;
      if (effPrecision > 1) effPrecision = 1.0;

      if (skillData.force === 'HuiXin') {
        effCritRate = 1;
        effIntentRate = 0;
        effPrecision = 1;
      }
      if (skillData.force === 'HuiYi') {
        effCritRate = 0;
        effIntentRate = 1;
        effPrecision = 1;
      }

      let ratioGlance = (1 - effPrecision) * (1 - effIntentRate);
      if (skillData.force === 'BuCaShang') ratioGlance = 0;
      const ratioIntent = effIntentRate;
      const ratioCrit =
        effCritRate + effIntentRate <= 1
          ? effCritRate * effPrecision
          : effPrecision * (1 - effIntentRate);
      const ratioNormal = Math.max(0, 1 - ratioGlance - ratioCrit - ratioIntent);

      let weaponBonus = 0;
      if (
        (skillData.type === 'WuQi' || skillData.type === 'Inner Way') &&
        skillData.weaponType !== 'N/A'
      ) {
        weaponBonus += stats.allArtsDmgBonus / 100;
      }
      if (skillData.weaponType && weaponBonusMap[skillData.weaponType]) {
        weaponBonus += weaponBonusMap[skillData.weaponType] / 100;
      }
      if (skillData.weaponType === 'DanTiQiShu') weaponBonus += stats.singleMagicBonus / 100;
      if (skillData.weaponType === 'QunTiQiShu') weaponBonus += stats.groupMagicBonus / 100;

      let finalGlobalMult = 1 + action.generalBonus + stats.bossDmgBonus / 100 + weaponBonus;
      if (cachedSetName === 'LianXing') finalGlobalMult += Number(skillData.modifiers?.['LianXing']) || 0;

      if (skillData.isCharge === 1 && cachedCheckXinfa('WeiMengGe')) finalGlobalMult += 0.15;
      if (cachedCheckXinfa('KangZaoDaFa')) finalGlobalMult += 0.1;
      let duanyueBonus = 0;
      if (cachedSetName === 'DuanYue') {
        duanyueBonus = 0.05;
        if (skillData.modifiers?.['DuanYue']) duanyueBonus += 0.05;
      }
      finalGlobalMult += duanyueBonus;
      if (skillData.modifiers?.['YanLiu'] && cachedSetName === 'YanLiu') finalGlobalMult += 0.12;
      if (cachedCheckXinfa('ZhengRenGui') || cachedCheckXinfa('MingHuiTongChen')) finalGlobalMult += 0.08;

      let outerSetMult = cachedSetName === 'FeiSun' ? 1.1 : cachedSetName === 'HanTian' ? 1.05 : 1.0;
      outerSetMult *= 1 + (skillData.exATK || 0);

      let finalBossDef = cachedBossDef * (skillData.modifiers?.['EShen'] ? 0.9 : 1);
      finalBossDef = finalBossDef * (action.yongquan === 'TRUE' ? 0.95 : 1);

      let effMinOuter = Math.max(0, stats.minOuter * outerSetMult - finalBossDef + 140);
      let effMaxOuter = Math.max(0, stats.maxOuter * outerSetMult - finalBossDef + 280);
      if (skillData.special === 'MoDaoTianFu') effMaxOuter += 60;
      if (effMaxOuter < effMinOuter) effMaxOuter = effMinOuter;
      const effAvgOuter = (effMinOuter + effMaxOuter) / 2;

      const isDuanShiSkill = !!skillData.modifiers?.['DuanShi'];
      const dsBonus = isDuanShiSkill && cachedHasDuanShi ? 25 : 0;
      const shBonus = cachedHasSuoHen ? 10 : 0;
      const yiShuiBonus = cachedHasYiShui && action.yishui ? action.yishui : 0;
      const threeQiongPenBonus =
        skillData.modifiers?.['SanQiong'] === 2 && cachedCheckXinfa('SanQiongZhiZhi') ? 20 : 0;
      const chuanHouModifier = Number(skillData.modifiers?.['ChuanHou']) || 0;
      const chuanHouPenBonus =
        chuanHouModifier > 0 && cachedCheckXinfa('ChuanHouJue') ? chuanHouModifier : 0;

      const outerPenBonus =
        (stats.outerPen +
          (skillData.exPen || 0) +
          dsBonus +
          shBonus +
          yiShuiBonus +
          threeQiongPenBonus +
          chuanHouPenBonus) /
        200;

      const specBonus =
        skillData.special === 'ShuShu' ? 0.24 : skillData.special === 'HuiXuanSan' ? 0.15 : 0;
      let effOuterDmgBonus = stats.outerDmgBonus / 100 + specBonus;
      if (cachedCurrentClass === 'PoZhuYuan' && !action.name.includes('NoneFanDou')) {
        effOuterDmgBonus += 0.09;
      }

      let critMult = 1 + stats.critDmgBonus / 100 + (skillData.exCritDmg || 0) + dsBonus / 100;
      let intentMult = 1 + stats.intentDmgBonus / 100 + (skillData.exIntentDmg || 0);
      if (cachedSetName === 'ShiYu') critMult += 0.1;
      if (cachedSetName === 'HuanHua') critMult += 0.15;
      if (action.name.includes('Q') && cachedCheckXinfa('DaTangGe')) critMult += 0.15;
      if (skillData.modifiers?.['YuDou'] && cachedSetName === 'YuDou') intentMult += 0.1;
      if (cachedCheckXinfa('NingShenZhang')) intentMult += 0.1;
      if (skillData.modifiers?.['YiJing'] && cachedCheckXinfa('YiJingYiWu')) critMult += 0.2;
      if (chuanHouModifier > 0 && cachedCheckXinfa('ChuanHouJue')) {
        critMult += chuanHouModifier / 100;
      }

      const dOutGlance = calcDmg(
        effMinOuter,
        skillData.outerRatio,
        outerPenBonus,
        1 + effOuterDmgBonus,
        1
      );
      const dOutCrit = calcDmg(
        effAvgOuter,
        skillData.outerRatio,
        outerPenBonus,
        1 + effOuterDmgBonus,
        critMult
      );
      const dOutIntent = calcDmg(
        effMaxOuter,
        skillData.outerRatio,
        outerPenBonus,
        1 + effOuterDmgBonus,
        intentMult
      );
      const dOutNormal = calcDmg(
        effAvgOuter,
        skillData.outerRatio,
        outerPenBonus,
        1 + effOuterDmgBonus,
        1
      );
      const outerExp =
        dOutGlance * ratioGlance +
        dOutCrit * ratioCrit +
        dOutIntent * ratioIntent +
        dOutNormal * ratioNormal;

      let effFixed = skillData.fixed;
      if (skillData.type === 'WuQi') effFixed *= 1 + stats.fixedDmgBonus;
      const fixedPenBonus = outerPenBonus;
      const fixedDmgMultiplier = 1 + effOuterDmgBonus;

      const dfNormal = calcDmg(effFixed, 1.0, fixedPenBonus, fixedDmgMultiplier, 1);
      const dfCrit = calcDmg(effFixed, 1.0, fixedPenBonus, fixedDmgMultiplier, critMult);
      const dfIntent = calcDmg(effFixed, 1.0, fixedPenBonus, fixedDmgMultiplier, intentMult);
      const fixedExp =
        dfNormal * (ratioGlance + ratioNormal) + dfCrit * ratioCrit + dfIntent * ratioIntent;

      function calcElementPart(
        eleName: string,
        minEle: number,
        maxEle: number,
        elePen: number,
        eleDmgBonus: number
      ) {
        let eleSetMult = cachedSetName === 'HanTian' ? 1.05 : 1.0;
        const extraEleAtk =
          skillData?.type === 'WuQi' && skillData?.element === eleName
            ? 150.7 * (1 + stats.fixedDmgBonus)
            : 0;
        let effMinEle = minEle * eleSetMult + extraEleAtk;
        let effMaxEle = maxEle * eleSetMult + extraEleAtk;
        if (effMaxEle < effMinEle) effMaxEle = effMinEle;
        const effAvgEle = (effMinEle + effMaxEle) / 2;
        const elePenBonus = elePen / 200;
        const usedRatio = skillData?.element === eleName ? skillData.eleRatio : (skillData?.outerRatio ?? 0);
        const effEleDmgBonus = eleDmgBonus / 100;

        const dGlance = calcDmg(effMinEle, usedRatio, elePenBonus, 1 + effEleDmgBonus, 1);
        const dNormal = calcDmg(effAvgEle, usedRatio, elePenBonus, 1 + effEleDmgBonus, 1);
        const dCrit = calcDmg(effAvgEle, usedRatio, elePenBonus, 1 + effEleDmgBonus, critMult);
        const dIntent = calcDmg(effMaxEle, usedRatio, elePenBonus, 1 + effEleDmgBonus, intentMult);
        return {
          exp:
            dGlance * ratioGlance +
            dNormal * ratioNormal +
            dCrit * ratioCrit +
            dIntent * ratioIntent,
          min: effMinEle,
          max: effMaxEle,
          avg: effAvgEle,
          dGlance,
          dNormal,
          dCrit,
          dIntent,
          dmgBonus: effEleDmgBonus,
          penBonus: elePenBonus,
          extraEleAtk,
          eleSetMult,
        };
      }

      let threeQiongBonus = 0;
      let hanTianPenBonus = 0;
      let poZhuElementDmgBonus = 0;
      let poZhuElementPenBonus = 0;
      let allElementPenBonus = 0;
      let mingJinPenBonus = 0;
      let lieShiElementPenBonus = 0;
      if (
        skillData.modifiers?.['SanQiong'] === 1 ||
        (skillData.modifiers?.['SanQiong'] === 2 && cachedCheckXinfa('SanQiongZhiZhi'))
      ) {
        threeQiongBonus = 20;
      }
      if (
        (skillData.special === 'HanTian' || skillData.special === 'ShuShu') &&
        cachedSetName === 'HanTian'
      ) {
        hanTianPenBonus += 4;
      }
      if (cachedCurrentClass === 'PoZhuYuan' && !action.name.includes('NoneFanDou')) {
        poZhuElementDmgBonus += 9;
      }
      if (cachedCurrentClass.includes('LieShiJun')) {
        lieShiElementPenBonus += 12;
      }
      if (skillData.special === 'E Wai Quan Shu Xing Penetration') {
        allElementPenBonus += 8;
      }
      if (skillData.special === 'E Wai Ming Jin Penetration') {
        mingJinPenBonus += 15;
      }
      if (skillData.modifiers?.['KuGuo']) {
        poZhuElementPenBonus += 10;
      }
      const poZhuData = calcElementPart(
        'PoZhu',
        stats.minPoZhu,
        stats.maxPoZhu,
        stats.poZhuPen +
          threeQiongBonus +
          hanTianPenBonus +
          allElementPenBonus +
          poZhuElementPenBonus,
        stats.poZhuDmgBonus + poZhuElementDmgBonus
      );
      const mingJinData = calcElementPart(
        'MingJin',
        stats.minMingJin,
        stats.maxMingJin,
        stats.mingJinPen + threeQiongBonus + hanTianPenBonus + allElementPenBonus + mingJinPenBonus,
        stats.mingJinDmgBonus
      );
      const lieShiData = calcElementPart(
        'LieShi',
        stats.minLieShi,
        stats.maxLieShi,
        stats.lieShiPen +
          threeQiongBonus +
          hanTianPenBonus +
          allElementPenBonus +
          lieShiElementPenBonus,
        stats.lieShiDmgBonus
      );
      const qianSiData = calcElementPart(
        'QianSi',
        stats.minQianSi,
        stats.maxQianSi,
        stats.qianSiPen + threeQiongBonus + hanTianPenBonus + allElementPenBonus,
        stats.qianSiDmgBonus
      );

      const poZhuExp = poZhuData.exp;
      const mingJinExp = mingJinData.exp;
      const lieShiExp = lieShiData.exp;
      const qianSiExp = qianSiData.exp;

      const totalPartExp = outerExp + fixedExp + poZhuExp + mingJinExp + lieShiExp + qianSiExp;
      let finalSkillDmg = totalPartExp * finalGlobalMult * 1;

      if (action.isDingyin) finalSkillDmg *= 1 + stats.specificSkillBonus / 100;
      const totalDmgForAction = finalSkillDmg * action.count;

      if (debug) {
        console.groupCollapsed(`[${idx + 1}] ${action.name} (${totalDmgForAction.toFixed(2)})`);
        console.log('📋 JiNengXinXi:');
        console.log(`  LeiXing: ${skillData.type || 'WeiZhi'}`);
        console.log(`  WuQiLeiXing: ${skillData.weaponType || 'N/A'}`);
        console.log(`  YuanSu: ${skillData.element || 'None'}`);
        console.log(`  TeShu: ${skillData.special || 'None'}`);
        console.log(`  QiangZhiLeiXing: ${skillData.force || 'None'}`);
        console.log(`  BeiL: WaiGong=${skillData.outerRatio || 0}, ShuXing=${skillData.eleRatio || 0}`);
        console.log(`  GuShang: ${skillData.fixed || 0}`);
        console.log(`  CiShu: ${action.count || 1}`);
        console.log(`  ShiFouDingyin: ${action.isDingyin ? 'Shi' : 'Fou'}`);
        console.log(`  ShiFouJiRuJieSuan: ${action.included ? 'Shi' : 'Fou'}`);
        console.log('🎯 MingZhongGaiL:');
        console.log(`  Accuracy: ${(effPrecision * 100).toFixed(2)}%`);
        console.log(`  Crit Rate: ${(effCritRate * 100).toFixed(2)}%`);
        if (cachedSetName === 'HuanHua') console.log(`    BaoHanHuanHuaSetBaiZiHuiXinL: 5%`);
        console.log(`  Insight Rate: ${(effIntentRate * 100).toFixed(2)}%`);
        if (skillData.modifiers?.['ChangFeng']) {
          console.log(`  BaoHanChangFengShengXiaoHuiYiL: 3%`);
          if (cachedSetName === 'YuDou') console.log(`    BaoHanYuDouSetShengXiaoHuiYiL: 7.5%`);
        }
        console.log(`  Direct Crit Rate: ${stats.directCrit.toFixed(2)}%`);
        console.log(`  Direct Insight Rate: ${stats.directIntent.toFixed(2)}%`);
        if (skillData.exCrit)
          console.log(`  JiNengEWaiHuiXinL: ${(skillData.exCrit * 100).toFixed(2)}%`);
        if (skillData.exIntent)
          console.log(`  JiNengEWaiHuiYiL: ${(skillData.exIntent * 100).toFixed(2)}%`);
        console.log('  ZuiZhongShangHaiZhanBi:');
        console.log(`    CaShang: ${(ratioGlance * 100).toFixed(2)}%`);
        console.log(`    PuTong: ${(ratioNormal * 100).toFixed(2)}%`);
        console.log(`    HuiXin: ${(ratioCrit * 100).toFixed(2)}%`);
        console.log(`    HuiYi: ${(ratioIntent * 100).toFixed(2)}%`);

        console.groupEnd();
      }

      totalExpectedDamage += totalDmgForAction;
      if (action.included) settlementDamagePool += totalDmgForAction;
    });

    let settlementBonusRate = 0;
    if (currentClass === 'PoZhuChen') settlementBonusRate = 0.1;
    if (currentClass === 'PoZhuFeng') settlementBonusRate = 0.3;
    const settlementBonus = settlementDamagePool * settlementBonusRate;
    if (settlementBonus > 0 && settlementBonusRate > 0) {
      totalExpectedDamage += settlementBonus;
      if (debug) {
        console.log('💰 JieSuanJiaCheng:');
        console.log(`  JieSuanChiShangHai: ${settlementDamagePool.toFixed(2)}`);
        console.log(`  JieSuanJiaCheng: +${settlementBonus.toFixed(2)}`);
      }
    }

    const baselineValue = baseline || 4244078.34;
    const rate = (totalExpectedDamage / baselineValue) * 100;

    if (debug) {
      console.log('='.repeat(60));
      console.log('📊 ZuiZhongJiSuanJieGuo:');
      console.log(`  ZhouQiWangShangHai: ${totalExpectedDamage.toFixed(2)}`);
      const rotationConfig = ClassConfig.ROTATIONS[currentClass];
      const useTime = rotationConfig && rotationConfig.useTime ? rotationConfig.useTime : 1;
      const dps = totalExpectedDamage / useTime;
      console.log(`  ZhouQiWangMiaoShang: ${dps.toFixed(2)} (YongShi: ${useTime}Miao)`);
      console.log(`  JiZhunZhi: ${baselineValue.toFixed(2)}`);
      console.log(`  Graduation Rate: ${rate.toFixed(2)}%`);
      console.log('='.repeat(60));
      console.groupEnd();
    }

    return {
      totalDamage: Math.round(totalExpectedDamage),
      graduationRate: `${rate.toFixed(2)}%`,
      debugInfo: { avgOuterAtk: (rawStats.minOuter + rawStats.maxOuter) / 2 },
    };
  },

  addStatWithTrack(
    totalObj: Record<string, number>,
    statObj: { type: string; value: number },
    trackFn?: (k: string, v: number) => void
  ) {
    if (!statObj || !statObj.type || isNaN(parseFloat(String(statObj.value)))) return;
    const type = statObj.type;
    const val = parseFloat(String(statObj.value));
    if (totalObj[type] !== undefined) {
      totalObj[type] += val;
    } else {
      totalObj[type] = val;
    }
    if (trackFn) trackFn(type, val);
  },
};
