import { CommonData } from './data/commonData';
import { statLabel } from './statName';

export interface StatDisplayItem {
  label: string;
  value: string;
  highlight?: string; // 抗性后的值，用橘黄色显示
  suffix?: string; // 溢出信息等后缀
  isLoaned?: boolean; // 是否为贷款值
  isEarlySeason?: boolean; // 是否为提前获得下赛季属性
}

const shouldPercent = (key: string) =>
  CommonData.PERCENT_STATS.includes(key) ||
  key.includes('率') ||
  key.includes('加成') ||
  key.includes('增效') ||
  key.includes('增伤');

// 贷款会影响的属性列表
const LOANED_STATS = [
  '外功穿透',
  '指定武学技能增伤',
];

// 提前获得下赛季属性会影响的属性列表
const EARLY_SEASON_STATS = [
  '实际精准率',
  '实际会心率',
  '实际会意率',
  '外功攻击', // 攻击范围的特殊处理
];

export const buildStatsDisplay = (
  rawTotals: Record<string, number>,
  currentClass: string,
  setType: string,
  loanDingyin = false,
  earlySeasonBonus = false
): StatDisplayItem[] => {
  const totals = { ...rawTotals };
  const items: StatDisplayItem[] = [];

  const overflowData = {
    precision: totals['精准率溢出'] || 0,
    crit: totals['会心率溢出'] || 0,
    intent: totals['会意率溢出'] || 0,
  };

  const rawValues = {
    precision: totals['精准率白值'] || 0,
    crit: totals['会心率白值'] || 0,
    intent: totals['会意率白值'] || 0,
  };

  const attackPairs = [
    { label: '外功攻击', min: '最小外功攻击', max: '最大外功攻击' },
    { label: '鸣金攻击', min: '最小鸣金攻击', max: '最大鸣金攻击' },
    { label: '裂石攻击', min: '最小裂石攻击', max: '最大裂石攻击' },
    { label: '牵丝攻击', min: '最小牵丝攻击', max: '最大牵丝攻击' },
    { label: '破竹攻击', min: '最小破竹攻击', max: '最大破竹攻击' },
    { label: '无相攻击', min: '最小无相攻击', max: '最大无相攻击' },
  ];

  attackPairs.forEach((pair) => {
    const min = totals[pair.min] || 0;
    const max = totals[pair.max] || 0;
    if (min > 0 || max > 0) {
      // 外功攻击受下赛季属性影响
      const isEarlySeason = earlySeasonBonus && EARLY_SEASON_STATS.includes(pair.label);
      items.push({ label: statLabel(pair.label), value: `${min} - ${max}`, isEarlySeason });
      delete totals[pair.min];
      delete totals[pair.max];
    }
  });

  const skillNameMap: Record<string, string> = {
    鸣金影: '积矩九剑·流血增伤',
    鸣金虹: '无名剑法·蓄力技增伤',
    破竹尘: '醉梦游春·武学技增伤',
    破竹风: '栗子游尘·鼠鼠增伤',
    '裂石钧（纯唐）': '斩雪刀法·轻重击派生技增伤',
    '裂石钧（双切）': '十方破阵·蓄力技增伤',
    牵丝玉: '九重春色·特殊技增伤',
    裂石威: '嗟夫刀法·蓄力技增伤',
    破竹鸢: '天志垂象·蓄力技增伤',
  };

  if (totals['指定武学技能增伤'] > 0 && currentClass !== '牵丝霖' && skillNameMap[currentClass]) {
    totals[skillNameMap[currentClass]] = totals['指定武学技能增伤'];
    delete totals['指定武学技能增伤'];
  }

  const order = [
    '实际精准率',
    '实际会心率',
    '实际会意率',
    '直接会心率',
    '直接会意率',
    '会心伤害加成',
    '会意伤害加成',
    '外功穿透',
    '外功伤害加成',
    '属攻穿透',
    '鸣金伤害加成',
    '裂石伤害加成',
    '牵丝伤害加成',
    '破竹伤害加成',
    '全武学增效',
    '对首领单位增伤',
    '单体类奇术增伤',
    '群体类奇术增伤',
  ];

  // 检查当前职业对应的技能增伤属性名
  const mappedSkillName = skillNameMap[currentClass];

  const isLoanedStat = (key: string) => {
    if (!loanDingyin) return false;
    if (LOANED_STATS.includes(key)) return true;
    // 检查是否为职业对应的技能增伤
    if (mappedSkillName && key === mappedSkillName) return true;
    return false;
  };

  const isEarlySeasonStat = (key: string) => {
    if (!earlySeasonBonus) return false;
    return EARLY_SEASON_STATS.includes(key);
  };

  const renderItem = (key: string, val: number) => {
    const label = key.replace('实际', '');
    let displayValue = '';
    let highlight: string | undefined;
    let suffix: string | undefined;
    const isLoaned = isLoanedStat(key);
    const isEarlySeason = isEarlySeasonStat(key);

    // 精准率、会心率、会意率显示为 "白值%（抗性后的值%）"
    if (key === '实际精准率') {
      displayValue = `${rawValues.precision.toFixed(1)}%`;
      highlight = `（${val}%）`;
      if (overflowData.precision > 0) {
        suffix = ` 溢出${overflowData.precision.toFixed(1)}%白值`;
      }
    } else if (key === '实际会心率') {
      displayValue = `${rawValues.crit.toFixed(1)}%`;
      highlight = `（${val}%）`;
      if (overflowData.crit > 0) {
        let overflowReason = '';
        overflowReason += currentClass === '裂石威' ? '陌刀' : '';
        overflowReason += setType === '浣花' ? '浣花' : '';
        suffix = ` ${overflowReason}溢出${overflowData.crit.toFixed(1)}%白值`;
      }
    } else if (key === '实际会意率') {
      displayValue = `${rawValues.intent.toFixed(1)}%`;
      highlight = `（${val}%）`;
      if (overflowData.intent > 0) {
        suffix = ` 溢出${overflowData.intent.toFixed(1)}%白值`;
      }
    } else {
      const isPercent = shouldPercent(key);
      displayValue = `${val}${isPercent ? '%' : ''}`;
    }

    items.push({
      label: statLabel(label),
      value: displayValue,
      highlight,
      suffix,
      isLoaned,
      isEarlySeason,
    });
  };

  order.forEach((key) => {
    if (totals[key] !== undefined && totals[key] !== 0) {
      renderItem(key, totals[key]);
      delete totals[key];
    }
  });

  Object.entries(totals).forEach(([key, val]) => {
    const excludeKeys = [
      '精准率溢出', '会心率溢出', '会意率溢出',
      '精准率白值', '会心率白值', '会意率白值',
    ];
    if (val > 0 && !excludeKeys.includes(key)) {
      renderItem(key, val);
    }
  });

  return items;
};
