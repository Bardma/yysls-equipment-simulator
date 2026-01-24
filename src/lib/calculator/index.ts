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
    let baseSanWei = CommonData.BASE_STATS['敏'];

    if (debug) {
      console.groupCollapsed(`📊 面板计算流程 (流派: ${currentClass || '未选择'})`);
      console.log('1. 初始基础面板:', JSON.parse(JSON.stringify(total)));
    }

    if (currentClass) {
      const prefix = currentClass.substring(0, 2);
      if (['鸣金', '裂石', '牵丝', '破竹'].includes(prefix)) {
        const minKey = `最小${prefix}攻击`;
        const maxKey = `最大${prefix}攻击`;
        const damageKey = `${prefix}伤害加成`;

        total[minKey] = (total[minKey] || 0) + 360.0;
        total[maxKey] = (total[maxKey] || 0) + 721.0;
        total[damageKey] = (total[damageKey] || 0) + 11.8;
      }
    }

    if (debug) {
      console.group('2. 装备加成明细');
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
        total['最小外功攻击'] = (total['最小外功攻击'] || 0) + minAdd;
        total['最大外功攻击'] = (total['最大外功攻击'] || 0) + maxAdd;
        track('最小外功攻击(白值)', minAdd);
        track('最大外功攻击(白值)', maxAdd);
      } else if (equip.slotId === '3') {
        const val = equip.isPurple ? 90 : 100;
        total['最小外功攻击'] = (total['最小外功攻击'] || 0) + val;
        track('最小外功攻击(白值)', val);
      } else if (equip.slotId === '4') {
        const val = equip.isPurple ? 135 : 150;
        total['最大外功攻击'] = (total['最大外功攻击'] || 0) + val;
        track('最大外功攻击(白值)', val);
      }

      if (
        equip.mainStat &&
        equip.mainStat.type !== '生存类词条' &&
        equip.mainStat.type !== '生存向'
      ) {
        this.addStatWithTrack(total, equip.mainStat, track);
      }
      if (equip.dingyinStat) this.addStatWithTrack(total, equip.dingyinStat, track);
      equip.subStats.forEach((sub: { type: string; value: number }) => {
        if (sub.type !== '生存类词条' && sub.type !== '生存向') {
          this.addStatWithTrack(total, sub, track);
        }
      });
      if (debug) {
        console.log(`- [${equip.slotName}] ${equip.name}:`, equipLog.adds);
      }
    });
    if (debug) {
      console.log('此时面板属性:', JSON.parse(JSON.stringify(total)));
      console.groupEnd();
    }

    if (debug) {
      console.group('3. 心法加成明细');
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
      console.group('4. 套装加成明细');
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
      console.group('5. 词条修改器加成明细');
    }
    if (
      statModifier &&
      statModifier.type &&
      statModifier.type !== '生存类词条' &&
      statModifier.type !== '生存向'
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
          statModifier.type === '劲' ||
          statModifier.type === '敏' ||
          statModifier.type === '势'
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
      console.group('6. 提前获得下半赛季属性加成明细');
    }
    if (earlySeasonBonus) {
      total['劲'] += 14;
      total['敏'] += 14;
      total['势'] += 14;
    }

    const totalJing = total['劲'] || 0;
    const totalMin = total['敏'] || 0;
    const totalShi = total['势'] || 0;
    const extraJing = Math.max(0, totalJing - baseSanWei);
    const extraMin = Math.max(0, totalMin - baseSanWei);
    const extraShi = Math.max(0, totalShi - baseSanWei);

    if (earlySeasonBonus) {
      baseSanWei += 14;
      total['精准率'] = (total['精准率'] || 0) + 1.4;
      if (debug) console.log(`- [提前获得下半赛季属性] 劲: 14, 敏: 14, 势: 14，精准率: 1.4`);
    }
    if (debug) {
      console.groupEnd();
    }
    if (debug) {
      console.group('7. 属性转化明细');
    }
    total['最小外功攻击'] += extraJing * 0.22 + extraMin * 0.9;
    if (debug) console.log(`- [属性转化] 最小外功攻击: ${extraJing * 0.22 + extraMin * 0.9}`);
    total['最大外功攻击'] += extraJing * 1.36 + extraShi * 0.9;
    if (debug) console.log(`- [属性转化] 最大外功攻击: ${extraJing * 1.36 + extraShi * 0.9}`);
    total['会心率'] += extraMin * 0.076;
    if (debug) console.log(`- [属性转化] 会心率: ${extraMin * 0.076}`);
    total['会意率'] += extraShi * 0.038;
    if (debug) console.log(`- [属性转化] 会意率: ${extraShi * 0.038}`);
    if (currentClass === '鸣金虹') {
      const effectiveShi = Math.min(totalShi, 300);
      total['会意率'] += effectiveShi * 0.015;
      total['最大外功攻击'] += effectiveShi * 0.264;
      if (debug) console.log(`- [鸣金虹属性转化] 最大外功攻击: ${effectiveShi * 0.264}`);
      if (debug) console.log(`- [鸣金虹属性转化] 会意率: ${effectiveShi * 0.015}`);
    }
    if (
      currentClass === '破竹鸢' ||
      currentClass === '破竹尘' ||
      currentClass === '破竹风' ||
      currentClass === '牵丝玉' ||
      currentClass === '牵丝霖' ||
      currentClass === '裂石钧（双切）' ||
      currentClass === '裂石钧（纯唐）'
    ) {
      const effectiveMin = Math.min(totalMin, 300);
      total['会心率'] += effectiveMin * 0.03;
      total['最小外功攻击'] += effectiveMin * 0.264;
      if (debug) console.log(`- [会心职业属性转化] 最小外功攻击: ${effectiveMin * 0.264}`);
      if (debug) console.log(`- [会心职业属性转化] 会心率: ${effectiveMin * 0.03}`);
    }
    if (currentClass === '裂石威') {
      const effectiveJing = Math.min(totalJing, 300);
      total['会心率'] += effectiveJing * 0.03;
      if (debug) console.log(`- [裂石威属性转化] 会心率: ${effectiveJing * 0.03}`);
    }
    if (currentClass === '鸣金影') {
      const effectiveJing = Math.min(totalJing, 300);
      total['会意率'] += effectiveJing * 0.015;
      total['最大外功攻击'] += effectiveJing * 0.264;
      if (debug) console.log(`- [鸣金影属性转化] 最大外功攻击: ${effectiveJing * 0.264}`);
      if (debug) console.log(`- [鸣金影属性转化] 会意率: ${effectiveJing * 0.015}`);
    }

    if (bowType === 'precision') total['精准率'] = (total['精准率'] || 0) + 4.7;
    else if (bowType === 'crit') total['会心率'] = (total['会心率'] || 0) + 5.2;
    else if (bowType === 'intent') total['会意率'] = (total['会意率'] || 0) + 2.6;
    if (debug) {
      console.log(
        `- [弓类属性转化] 精准率: ${bowType === 'precision' ? 4.7 : bowType === 'crit' ? 5.2 : 2.6}`
      );
      console.groupEnd();
    }
    if (debug) {
      console.group('8. 实际值和溢出值明细');
    }
    const rawCrit = total['会心率'] / 1.85;
    let exCrit = 0;
    if (currentClass === '裂石威') exCrit += 24;
    if (setType === '浣花') exCrit += 5;

    let finalCrit = rawCrit + exCrit;
    let critOverflow = 0;
    if (finalCrit > 80) {
      critOverflow = (finalCrit - 80) * 1.85;
      finalCrit -= exCrit;
      if (finalCrit > 80) finalCrit = 80;
    } else if (exCrit !== 0) {
      finalCrit -= exCrit;
    }
    total['实际会心率'] = finalCrit;
    total['会心率溢出'] = critOverflow;
    if (debug) console.log(`- [实际会心率] ${finalCrit}`);
    if (debug) console.log(`- [会心率溢出] ${critOverflow}`);

    const rawIntent = total['会意率'] / 1.85;
    let finalIntent = rawIntent;
    let intentOverflow = 0;
    if (finalIntent > 40) {
      intentOverflow = (finalIntent - 40) * 1.85;
      finalIntent = 40;
    }
    total['实际会意率'] = finalIntent;
    total['会意率溢出'] = intentOverflow;
    if (debug) console.log(`- [实际会意率] ${finalIntent}`);
    if (debug) console.log(`- [会意率溢出] ${intentOverflow}`);

    const rawAcc = (total['精准率'] - 65.065) / 1.85 + 65.065;
    let finalAcc = rawAcc;
    let accOverflow = 0;
    if (finalAcc > 100) {
      accOverflow = (finalAcc - 100) * 1.85;
      finalAcc = 100;
    }
    total['实际精准率'] = finalAcc;
    total['精准率溢出'] = accOverflow;
    if (debug) console.log(`- [实际精准率] ${finalAcc}`);
    if (debug) console.log(`- [精准率溢出] ${accOverflow}`);
    if (
      finalIntent +
        (finalCrit + exCrit > 80 ? 80 : finalCrit + exCrit) +
        total['直接会心率'] +
        total['直接会意率'] >
      100
    ) {
      const overflow =
        (finalIntent +
          (finalCrit + exCrit > 80 ? 80 : finalCrit + exCrit) +
          total['直接会心率'] +
          total['直接会意率'] -
          100) *
        1.85;
      total['会心率溢出'] += overflow;
      if (debug) console.log(`- [会心率溢出] 额外溢出: ${overflow}`);
    }
    if (debug) {
      console.log('此时明细:', JSON.parse(JSON.stringify(total)));
      console.groupEnd();
    }

    delete total['劲'];
    delete total['敏'];
    delete total['势'];
    // 保留白值供显示使用
    total['精准率白值'] = total['精准率'];
    total['会心率白值'] = total['会心率'];
    total['会意率白值'] = total['会意率'];
    delete total['精准率'];
    delete total['会心率'];
    delete total['会意率'];

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
      console.groupCollapsed('🧮 毕业率计算详情 (点击展开)');
    }

    const currentClass = (params['当前流派'] || params['currentClass'] || '') as string;
    const xinfaList = (params['心法'] || []) as string[] | string;
    const setName = (params['套装'] || '') as string;

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
      破竹: getVal('最大破竹攻击'),
      鸣金: getVal('最大鸣金攻击'),
      裂石: getVal('最大裂石攻击'),
      牵丝: getVal('最大牵丝攻击'),
      无相: getVal('最大无相攻击'),
    };
    let mainElement = '无';
    let highestAtk = -1;
    for (const [ele, val] of Object.entries(maxAtks)) {
      if (val > highestAtk) {
        highestAtk = val;
        mainElement = ele;
      }
    }
    const genPen = getVal('属攻穿透');
    const genDmg = getVal('属攻伤害加成');

    const rawStats = {
      minOuter: getVal('最小外功攻击'),
      maxOuter: getVal('最大外功攻击'),
      outerPen: getVal('外功穿透'),
      minPoZhu: getVal('最小破竹攻击'),
      maxPoZhu: getVal('最大破竹攻击'),
      poZhuPen: getVal('破竹穿透') + (mainElement === '破竹' ? genPen : 0),
      minMingJin: getVal('最小鸣金攻击'),
      maxMingJin: getVal('最大鸣金攻击'),
      mingJinPen: getVal('鸣金穿透') + (mainElement === '鸣金' ? genPen : 0),
      minLieShi: getVal('最小裂石攻击'),
      maxLieShi: getVal('最大裂石攻击'),
      lieShiPen: getVal('裂石穿透') + (mainElement === '裂石' ? genPen : 0),
      minQianSi: getVal('最小牵丝攻击'),
      maxQianSi: getVal('最大牵丝攻击'),
      qianSiPen: getVal('牵丝穿透') + (mainElement === '牵丝' ? genPen : 0),
      minWuXiang: getVal('最小无相攻击'),
      maxWuXiang: getVal('最大无相攻击'),
      wuXiangPen: getVal('无相穿透') + (mainElement === '无相' ? genPen : 0),
      outerDmgBonus: getVal('外功伤害加成'),
      poZhuDmgBonus: getVal('破竹伤害加成') + genDmg,
      mingJinDmgBonus: getVal('鸣金伤害加成') + genDmg,
      lieShiDmgBonus: getVal('裂石伤害加成') + genDmg,
      qianSiDmgBonus: getVal('牵丝伤害加成') + genDmg,
      precision: params['实际精准率'] !== undefined ? getVal('实际精准率') : getVal('精准率'),
      critRate: params['实际会心率'] !== undefined ? getVal('实际会心率') : getVal('会心率'),
      intentRate: params['实际会意率'] !== undefined ? getVal('实际会意率') : getVal('会意率'),
      directCrit: getVal('直接会心率'),
      directIntent: getVal('直接会意率'),
      bossDmgBonus: getVal('对首领单位增伤'),
      allArtsDmgBonus: getVal('全武学增效') || getVal('全武学增伤'),
      singleMagicBonus: getVal('单体类奇术增伤') || getVal('单体奇术增伤'),
      groupMagicBonus: getVal('群体类奇术增伤') || getVal('群体奇术增伤'),
      specificSkillBonus: getVal('指定武学技能增伤'),
      fixedDmgBonus: getVal('固伤加成') || 0.0725,
      critDmgBonus: getVal('会心伤害加成'),
      intentDmgBonus: getVal('会意伤害加成'),
    };

    const weaponBonusMap: Record<string, number> = {
      剑: getVal('剑武学增效'),
      枪: getVal('枪武学增效'),
      伞: getVal('伞武学增效'),
      扇: getVal('扇武学增效'),
      绳标: getVal('绳标武学增效'),
      双刀: getVal('双刀武学增效'),
      陌刀: getVal('陌刀武学增效'),
      横刀: getVal('横刀武学增效'),
      拳甲: getVal('拳甲武学增效'),
    };

    let bossDef = 498;
    const checkXinfa = (name: string) => {
      if (Array.isArray(xinfaList)) return xinfaList.includes(name);
      if (typeof xinfaList === 'string') return xinfaList.indexOf(name) > -1;
      return false;
    };
    if (currentClass === '破竹尘' && (checkXinfa('断石之构') || checkXinfa('大唐歌'))) {
      baseline = 4334428;
    }

    const hasSuoHen = checkXinfa('所恨年年');
    const hasDuanShi = checkXinfa('断石之构');
    const hasYiShui = checkXinfa('易水歌');
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
      if (skillData.element && skillData.element !== '无' && skillData.element !== 'N/A') {
        const eleKeyMap: Record<string, string> = {
          破竹: 'PoZhu',
          鸣金: 'MingJin',
          裂石: 'LieShi',
          牵丝: 'QianSi',
        };
        const suffix = eleKeyMap[skillData.element];
        if (suffix) {
          stats[`min${suffix}` as keyof typeof stats] += stats.minWuXiang;
          stats[`max${suffix}` as keyof typeof stats] += stats.maxWuXiang;
          stats[`${suffix.toLowerCase()}Pen` as keyof typeof stats] += stats.wuXiangPen;
        }
      }

      let effCritRate =
        stats.critRate / 100 + (skillData.exCrit || 0) + (cachedSetName === '浣花' ? 5 : 0);
      if (effCritRate > 0.8) effCritRate = 0.8;
      effCritRate += stats.directCrit / 100;

      let effIntentRate = stats.intentRate / 100 + (skillData.exIntent || 0);
      if (effIntentRate > 0.4) effIntentRate = 0.4;
      effIntentRate += stats.directIntent / 100;
      if (skillData.modifiers?.['长风']) {
        effIntentRate += 0.03;
        if (cachedSetName === '玉斗') effIntentRate += 0.075;
      }

      let effPrecision = stats.precision / 100;
      if (effPrecision > 1) effPrecision = 1.0;

      if (skillData.force === '会心') {
        effCritRate = 1;
        effIntentRate = 0;
        effPrecision = 1;
      }
      if (skillData.force === '会意') {
        effCritRate = 0;
        effIntentRate = 1;
        effPrecision = 1;
      }

      let ratioGlance = (1 - effPrecision) * (1 - effIntentRate);
      if (skillData.force === '不擦伤') ratioGlance = 0;
      const ratioIntent = effIntentRate;
      const ratioCrit =
        effCritRate + effIntentRate <= 1
          ? effCritRate * effPrecision
          : effPrecision * (1 - effIntentRate);
      const ratioNormal = Math.max(0, 1 - ratioGlance - ratioCrit - ratioIntent);

      let weaponBonus = 0;
      if (
        (skillData.type === '武器' || skillData.type === '心法') &&
        skillData.weaponType !== 'N/A'
      ) {
        weaponBonus += stats.allArtsDmgBonus / 100;
      }
      if (skillData.weaponType && weaponBonusMap[skillData.weaponType]) {
        weaponBonus += weaponBonusMap[skillData.weaponType] / 100;
      }
      if (skillData.weaponType === '单体奇术') weaponBonus += stats.singleMagicBonus / 100;
      if (skillData.weaponType === '群体奇术') weaponBonus += stats.groupMagicBonus / 100;

      let finalGlobalMult = 1 + action.generalBonus + stats.bossDmgBonus / 100 + weaponBonus;
      if (cachedSetName === '连星') finalGlobalMult += Number(skillData.modifiers?.['连星']) || 0;

      if (skillData.isCharge === 1 && cachedCheckXinfa('威猛歌')) finalGlobalMult += 0.15;
      if (cachedCheckXinfa('抗造大法')) finalGlobalMult += 0.1;
      let duanyueBonus = 0;
      if (cachedSetName === '断岳') {
        duanyueBonus = 0.05;
        if (skillData.modifiers?.['断岳']) duanyueBonus += 0.05;
      }
      finalGlobalMult += duanyueBonus;
      if (skillData.modifiers?.['烟柳'] && cachedSetName === '烟柳') finalGlobalMult += 0.12;
      if (cachedCheckXinfa('征人归') || cachedCheckXinfa('明晦同尘')) finalGlobalMult += 0.08;

      let outerSetMult = cachedSetName === '飞隼' ? 1.1 : cachedSetName === '撼天' ? 1.05 : 1.0;
      outerSetMult *= 1 + (skillData.exATK || 0);

      let finalBossDef = cachedBossDef * (skillData.modifiers?.['恶身'] ? 0.9 : 1);
      finalBossDef = finalBossDef * (action.yongquan === 'TRUE' ? 0.95 : 1);

      let effMinOuter = Math.max(0, stats.minOuter * outerSetMult - finalBossDef + 140);
      let effMaxOuter = Math.max(0, stats.maxOuter * outerSetMult - finalBossDef + 280);
      if (skillData.special === '陌刀天赋') effMaxOuter += 60;
      if (effMaxOuter < effMinOuter) effMaxOuter = effMinOuter;
      const effAvgOuter = (effMinOuter + effMaxOuter) / 2;

      const isDuanShiSkill = !!skillData.modifiers?.['断石'];
      const dsBonus = isDuanShiSkill && cachedHasDuanShi ? 25 : 0;
      const shBonus = cachedHasSuoHen ? 10 : 0;
      const yiShuiBonus = cachedHasYiShui && action.yishui ? action.yishui : 0;
      const threeQiongPenBonus =
        skillData.modifiers?.['三穷'] === 2 && cachedCheckXinfa('三穷致知') ? 20 : 0;
      const chuanHouModifier = Number(skillData.modifiers?.['穿喉']) || 0;
      const chuanHouPenBonus =
        chuanHouModifier > 0 && cachedCheckXinfa('穿喉决') ? chuanHouModifier : 0;

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
        skillData.special === '鼠鼠' ? 0.24 : skillData.special === '回旋伞' ? 0.15 : 0;
      let effOuterDmgBonus = stats.outerDmgBonus / 100 + specBonus;
      if (cachedCurrentClass === '破竹鸢' && !action.name.includes('无返豆')) {
        effOuterDmgBonus += 0.09;
      }

      let critMult = 1 + stats.critDmgBonus / 100 + (skillData.exCritDmg || 0) + dsBonus / 100;
      let intentMult = 1 + stats.intentDmgBonus / 100 + (skillData.exIntentDmg || 0);
      if (cachedSetName === '时雨') critMult += 0.1;
      if (cachedSetName === '浣花') critMult += 0.15;
      if (action.name.includes('Q') && cachedCheckXinfa('大唐歌')) critMult += 0.15;
      if (skillData.modifiers?.['玉斗'] && cachedSetName === '玉斗') intentMult += 0.1;
      if (cachedCheckXinfa('凝神章')) intentMult += 0.1;
      if (skillData.modifiers?.['移经'] && cachedCheckXinfa('移经易武')) critMult += 0.2;
      if (chuanHouModifier > 0 && cachedCheckXinfa('穿喉决')) {
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
      if (skillData.type === '武器') effFixed *= 1 + stats.fixedDmgBonus;
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
        let eleSetMult = cachedSetName === '撼天' ? 1.05 : 1.0;
        const extraEleAtk =
          skillData?.type === '武器' && skillData?.element === eleName
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
        skillData.modifiers?.['三穷'] === 1 ||
        (skillData.modifiers?.['三穷'] === 2 && cachedCheckXinfa('三穷致知'))
      ) {
        threeQiongBonus = 20;
      }
      if (
        (skillData.special === '撼天' || skillData.special === '鼠鼠') &&
        cachedSetName === '撼天'
      ) {
        hanTianPenBonus += 4;
      }
      if (cachedCurrentClass === '破竹鸢' && !action.name.includes('无返豆')) {
        poZhuElementDmgBonus += 9;
      }
      if (cachedCurrentClass.includes('裂石钧')) {
        lieShiElementPenBonus += 12;
      }
      if (skillData.special === '额外全属性穿透') {
        allElementPenBonus += 8;
      }
      if (skillData.special === '额外鸣金穿透') {
        mingJinPenBonus += 15;
      }
      if (skillData.modifiers?.['苦果']) {
        poZhuElementPenBonus += 10;
      }
      const poZhuData = calcElementPart(
        '破竹',
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
        '鸣金',
        stats.minMingJin,
        stats.maxMingJin,
        stats.mingJinPen + threeQiongBonus + hanTianPenBonus + allElementPenBonus + mingJinPenBonus,
        stats.mingJinDmgBonus
      );
      const lieShiData = calcElementPart(
        '裂石',
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
        '牵丝',
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
        console.log('📋 技能信息:');
        console.log(`  类型: ${skillData.type || '未知'}`);
        console.log(`  武器类型: ${skillData.weaponType || 'N/A'}`);
        console.log(`  元素: ${skillData.element || '无'}`);
        console.log(`  特殊: ${skillData.special || '无'}`);
        console.log(`  强制类型: ${skillData.force || '无'}`);
        console.log(`  倍率: 外功=${skillData.outerRatio || 0}, 属性=${skillData.eleRatio || 0}`);
        console.log(`  固伤: ${skillData.fixed || 0}`);
        console.log(`  次数: ${action.count || 1}`);
        console.log(`  是否定音: ${action.isDingyin ? '是' : '否'}`);
        console.log(`  是否计入结算: ${action.included ? '是' : '否'}`);
        console.log('🎯 命中概率:');
        console.log(`  精准率: ${(effPrecision * 100).toFixed(2)}%`);
        console.log(`  会心率: ${(effCritRate * 100).toFixed(2)}%`);
        if (cachedSetName === '浣花') console.log(`    包含浣花套装白字会心率: 5%`);
        console.log(`  会意率: ${(effIntentRate * 100).toFixed(2)}%`);
        if (skillData.modifiers?.['长风']) {
          console.log(`  包含长风生效会意率: 3%`);
          if (cachedSetName === '玉斗') console.log(`    包含玉斗套装生效会意率: 7.5%`);
        }
        console.log(`  直接会心率: ${stats.directCrit.toFixed(2)}%`);
        console.log(`  直接会意率: ${stats.directIntent.toFixed(2)}%`);
        if (skillData.exCrit)
          console.log(`  技能额外会心率: ${(skillData.exCrit * 100).toFixed(2)}%`);
        if (skillData.exIntent)
          console.log(`  技能额外会意率: ${(skillData.exIntent * 100).toFixed(2)}%`);
        console.log('  最终伤害占比:');
        console.log(`    擦伤: ${(ratioGlance * 100).toFixed(2)}%`);
        console.log(`    普通: ${(ratioNormal * 100).toFixed(2)}%`);
        console.log(`    会心: ${(ratioCrit * 100).toFixed(2)}%`);
        console.log(`    会意: ${(ratioIntent * 100).toFixed(2)}%`);

        console.groupEnd();
      }

      totalExpectedDamage += totalDmgForAction;
      if (action.included) settlementDamagePool += totalDmgForAction;
    });

    let settlementBonusRate = 0;
    if (currentClass === '破竹尘') settlementBonusRate = 0.1;
    if (currentClass === '破竹风') settlementBonusRate = 0.3;
    const settlementBonus = settlementDamagePool * settlementBonusRate;
    if (settlementBonus > 0 && settlementBonusRate > 0) {
      totalExpectedDamage += settlementBonus;
      if (debug) {
        console.log('💰 结算加成:');
        console.log(`  结算池伤害: ${settlementDamagePool.toFixed(2)}`);
        console.log(`  结算加成: +${settlementBonus.toFixed(2)}`);
      }
    }

    const baselineValue = baseline || 4244078.34;
    const rate = (totalExpectedDamage / baselineValue) * 100;

    if (debug) {
      console.log('='.repeat(60));
      console.log('📊 最终计算结果:');
      console.log(`  轴期望伤害: ${totalExpectedDamage.toFixed(2)}`);
      const rotationConfig = ClassConfig.ROTATIONS[currentClass];
      const useTime = rotationConfig && rotationConfig.useTime ? rotationConfig.useTime : 1;
      const dps = totalExpectedDamage / useTime;
      console.log(`  轴期望秒伤: ${dps.toFixed(2)} (用时: ${useTime}秒)`);
      console.log(`  基准值: ${baselineValue.toFixed(2)}`);
      console.log(`  毕业率: ${rate.toFixed(2)}%`);
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
