import { CommonData } from './data/commonData';

export interface StatDisplayItem {
  label: string;
  value: string;
  highlight?: string; // KangXingHouDeZhi，YongJuHuangSeXianShi
  suffix?: string; // YiChuXinXiDengHouZhui
  isLoaned?: boolean; // ShiFouWeiDaiKuanZhi
  isEarlySeason?: boolean; // ShiFouWeiTiQianHuoDeXiaSaiJiShuXing
}

const shouldPercent = (key: string) =>
  CommonData.PERCENT_STATS.includes(key) ||
  key.includes('L') ||
  key.includes('JiaCheng') ||
  key.includes(' Effectiveness') ||
  key.includes(' Damage Bonus');

// DaiKuanHuiYingXiangDeShuXingLieBiao
const LOANED_STATS = [
  'Outer Penetration',
  'Specific Skill Damage Bonus',
];

// TiQianHuoDeXiaSaiJiShuXingHuiYingXiangDeShuXingLieBiao
const EARLY_SEASON_STATS = [
  'ShiJiJingZhunL',
  'ShiJiHuiXinL',
  'ShiJiHuiYiL',
  'WaiGongGongJi', // GongJiFanWeiDeTeShuChuLi
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
    precision: totals['JingZhunLYiChu'] || 0,
    crit: totals['HuiXinLYiChu'] || 0,
    intent: totals['HuiYiLYiChu'] || 0,
  };

  const rawValues = {
    precision: totals['JingZhunLBaiZhi'] || 0,
    crit: totals['HuiXinLBaiZhi'] || 0,
    intent: totals['HuiYiLBaiZhi'] || 0,
  };

  const attackPairs = [
    { label: 'WaiGongGongJi', min: 'Min Outer Attack', max: 'Max Outer Attack' },
    { label: 'MingJinGongJi', min: 'Min Mingjin Attack', max: 'Max Mingjin Attack' },
    { label: 'LieShiGongJi', min: 'Min Lie Shi Attack', max: 'Max Lie Shi Attack' },
    { label: 'QianSiGongJi', min: 'Min Qian Si Attack', max: 'Max Qian Si Attack' },
    { label: 'PoZhuGongJi', min: 'Min Po Zhu Attack', max: 'Max Po Zhu Attack' },
    { label: 'NoneXiangGongJi', min: 'ZuiXiaoNoneXiangGongJi', max: 'ZuiDaNoneXiangGongJi' },
  ];

  attackPairs.forEach((pair) => {
    const min = totals[pair.min] || 0;
    const max = totals[pair.max] || 0;
    if (min > 0 || max > 0) {
      // WaiGongGongJiShouXiaSaiJiShuXingYingXiang
      const isEarlySeason = earlySeasonBonus && EARLY_SEASON_STATS.includes(pair.label);
      items.push({ label: pair.label, value: `${min} - ${max}`, isEarlySeason });
      delete totals[pair.min];
      delete totals[pair.max];
    }
  });

  const skillNameMap: Record<string, string> = {
    MingJinYing: 'JiJuJiuJian·Liu Xue Damage Bonus',
    MingJinHong: 'NoneMingJianFa·Xu Li Ji Damage Bonus',
    PoZhuChen: 'ZuiMengYouChun·Wu Xue Ji Damage Bonus',
    PoZhuFeng: 'LiZiYouChen·Shu Shu Damage Bonus',
    'LieShiJun（ChunTang）': 'ZhanXueDaoFa·Qing Zhong Ji Pai Sheng Ji Damage Bonus',
    'LieShiJun（ShuangQie）': 'ShiFangPoZhen·Xu Li Ji Damage Bonus',
    QianSiYu: 'JiuChongChunSe·Te Shu Ji Damage Bonus',
    LieShiWei: 'JieFuDaoFa·Xu Li Ji Damage Bonus',
    PoZhuYuan: 'TianZhiChuiXiang·Xu Li Ji Damage Bonus',
  };

  if (totals['Specific Skill Damage Bonus'] > 0 && currentClass !== 'QianSiLin' && skillNameMap[currentClass]) {
    totals[skillNameMap[currentClass]] = totals['Specific Skill Damage Bonus'];
    delete totals['Specific Skill Damage Bonus'];
  }

  const order = [
    'ShiJiJingZhunL',
    'ShiJiHuiXinL',
    'ShiJiHuiYiL',
    'Direct Crit Rate',
    'Direct Insight Rate',
    'Crit Damage Bonus',
    'Insight Damage Bonus',
    'Outer Penetration',
    'Outer Damage Bonus',
    'Elemental Penetration',
    'Mingjin Damage Bonus',
    'Lieshi Damage Bonus',
    'Qiansi Damage Bonus',
    'Pozhu Damage Bonus',
    'All Martial Arts Effectiveness',
    'Boss Damage Bonus',
    'Singletarget Technique Damage Bonus',
    'AoE Technique Damage Bonus',
  ];

  // Jian Cha Dang Qian Zhi Ye Dui Ying De Ji Neng Shu Xing Ming Damage Bonus
  const mappedSkillName = skillNameMap[currentClass];

  const isLoanedStat = (key: string) => {
    if (!loanDingyin) return false;
    if (LOANED_STATS.includes(key)) return true;
    // Jian Cha Shi Fou Wei Zhi Ye Dui Ying De Ji Neng Damage Bonus
    if (mappedSkillName && key === mappedSkillName) return true;
    return false;
  };

  const isEarlySeasonStat = (key: string) => {
    if (!earlySeasonBonus) return false;
    return EARLY_SEASON_STATS.includes(key);
  };

  const renderItem = (key: string, val: number) => {
    const label = key.replace('ShiJi', '');
    let displayValue = '';
    let highlight: string | undefined;
    let suffix: string | undefined;
    const isLoaned = isLoanedStat(key);
    const isEarlySeason = isEarlySeasonStat(key);

    // Accuracy、Crit Rate、HuiYiLXianShiWei "BaiZhi%（KangXingHouDeZhi%）"
    if (key === 'ShiJiJingZhunL') {
      displayValue = `${rawValues.precision.toFixed(1)}%`;
      highlight = `（${val}%）`;
      if (overflowData.precision > 0) {
        suffix = ` YiChu${overflowData.precision.toFixed(1)}%BaiZhi`;
      }
    } else if (key === 'ShiJiHuiXinL') {
      displayValue = `${rawValues.crit.toFixed(1)}%`;
      highlight = `（${val}%）`;
      if (overflowData.crit > 0) {
        let overflowReason = '';
        overflowReason += currentClass === 'LieShiWei' ? 'MoDao' : '';
        overflowReason += setType === 'HuanHua' ? 'HuanHua' : '';
        suffix = ` ${overflowReason}YiChu${overflowData.crit.toFixed(1)}%BaiZhi`;
      }
    } else if (key === 'ShiJiHuiYiL') {
      displayValue = `${rawValues.intent.toFixed(1)}%`;
      highlight = `（${val}%）`;
      if (overflowData.intent > 0) {
        suffix = ` YiChu${overflowData.intent.toFixed(1)}%BaiZhi`;
      }
    } else {
      const isPercent = shouldPercent(key);
      displayValue = `${val}${isPercent ? '%' : ''}`;
    }

    items.push({
      label,
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
      'JingZhunLYiChu', 'HuiXinLYiChu', 'HuiYiLYiChu',
      'JingZhunLBaiZhi', 'HuiXinLBaiZhi', 'HuiYiLBaiZhi',
    ];
    if (val > 0 && !excludeKeys.includes(key)) {
      renderItem(key, val);
    }
  });

  return items;
};
