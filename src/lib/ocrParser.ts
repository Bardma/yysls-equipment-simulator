'use client';

import { createWorker, PSM } from 'tesseract.js';

import { CommonData } from './data/commonData';

// Tesseract Worker ShiLi
let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
let isInitializing = false;

/**
 * HuoQuHuoChuangJian Tesseract Worker
 */
async function getWorker() {
  if (worker) return worker;

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (worker) return worker;
  }

  isInitializing = true;
  try {
    console.log('[OCR] Creating Tesseract worker...');

    worker = await createWorker('chi_sim', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
        } else {
          console.log('[OCR]', m.status);
        }
      },
    });

    // SheZhiShiBieCanShu
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    });

    console.log('[OCR] Tesseract worker ready');
    return worker;
  } catch (error) {
    console.error('[OCR] Failed to create worker:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * ShiYong Tesseract.js JinXing OCR ShiBie（ZhiJieShiYongYuanShiTuPian，BuZuoYuChuLi）
 */
export async function recognizeImage(imageSource: File): Promise<string> {
  console.log('[OCR] Getting worker...');
  const tesseractWorker = await getWorker();

  console.log('[OCR] Starting recognition...');
  const result = await tesseractWorker.recognize(imageSource);

  console.log('[OCR] Recognition complete');
  console.log('[OCR] Recognized text:', result.data.text);
  console.log('[OCR] Confidence:', result.data.confidence);

  return result.data.text;
}

export interface ParsedStat {
  type: string;
  value: number;
  isConverted?: boolean; // ShiFouShiZhuanLAffix [Zhuan]
}

export interface OcrParseResult {
  mainStat?: ParsedStat;
  subStats: ParsedStat[];
  dingyinStat?: ParsedStat;
  convertedStat?: ParsedStat; // ZhuanLHouDeAffix
}

// QuanJuGanRaoCiPeiZhi（OCR ChangJianCuoWuShiBie）
const GLOBAL_ARTIFACTS = [
  'YiGuo', 'GuoGuo', 'GongQiang', 'XiangGuo', 'KuangHeng', 'KuangQiang', 'YiQiang',
  'GuoQiang', 'KuangGuo', 'HuiGuo', 'FuQiang', 'YiTan',
  'Jian', 'I', 'l', '。', '1，', '1,',
];

// HangShouGanRaoCi
const START_ARTIFACTS = ['，', ',', '+，', '+,', '.', ':', '1,', 'Xin'];

// AffixBieMingYingShe（OCR CuoWu -> ZhengQueMingCheng）
const STAT_ALIASES: Record<string, string> = {
  'NoneXiang Penetration': 'Elemental Penetration',
  'WaiGongGongJi': 'Max Outer Attack',
  'ZuiDaWaiGong': 'Max Outer Attack',
  'ZuiXiaoWaiGong': 'Min Outer Attack',
  'JiGuo': 'Strength',
  'Ji': 'Strength',
  'Hong': 'Strength',
  'Guo': 'Strength',
  'Li': 'Strength',
  'Fei': 'Strength',
  'Wei': 'Strength',
  'WeiGongGuo': 'Max Outer Attack',
  'Quan Jia Effectiveness': 'Fist Martial Art Effectiveness',
  'HuiXinJi': 'Crit Rate',
  'GuoSi': 'QianSi',
};

// Dingyin AffixLieBiao
const DINGYIN_STATS = ['Outer Penetration', 'Elemental Penetration', 'Specific Skill Damage Bonus'];

/**
 * QingXi OCR WenBen，YiChuGanRaoCi
 */
function cleanOcrLine(line: string): string {
  let cleanLine = line.replace(/\s+/g, '');

  // YiChuQuanJuGanRaoCi
  for (const artifact of GLOBAL_ARTIFACTS) {
    cleanLine = cleanLine.split(artifact).join('');
  }

  // TeShuTiHuan：| -> Strength
  cleanLine = cleanLine.replace(/\|/g, 'Strength');

  // YiChuHangShouGanRaoCi
  let hasGarbage = true;
  while (hasGarbage) {
    hasGarbage = false;
    for (const trash of START_ARTIFACTS) {
      if (cleanLine.startsWith(trash)) {
        cleanLine = cleanLine.substring(trash.length);
        hasGarbage = true;
        break;
      }
    }
    // QuChuHangShouShuZi
    if (/^\d+[，,]?/.test(cleanLine)) {
      cleanLine = cleanLine.replace(/^\d+[，,]?/, '');
      hasGarbage = true;
    }
  }

  return cleanLine;
}

/**
 * JiYuGuiZeDeAffixPiPei（CanKao spongem ShiXian）
 * ShiYongJianDanDe includes PanDuan，GengLingHuoDiChuLi OCR CuoWu
 */
function smartMatchStatName(line: string, isLastLine: boolean = false): string | null {
  // YouXianPiPeiChangAffix/TeShuAffix
  if (line.includes('ZhiDing') && line.includes(' Damage Bonus')) return 'Specific Skill Damage Bonus';
  // Zui Hou Yi Hang Qie Han Damage Bonus/Ji，Dou Di Wei Zhi Ding Wu Xue Ji Neng Damage Bonus
  if (isLastLine && (line.includes(' Damage Bonus') || line.includes('Ji'))) return 'Specific Skill Damage Bonus';

  if (line.includes('Shou') || line.includes('Ling')) return 'Boss Damage Bonus';

  // Wu Xue Lei Effectiveness
  if (line.includes('Quan')) return 'All Martial Arts Effectiveness';
  if (line.includes('Dan') || (line.includes('Ti') && line.includes('Qi'))) return 'Singletarget Technique Damage Bonus';
  if (line.includes('Qun')) return 'AoE Technique Damage Bonus';
  if (line.includes('San')) return 'Umbrella Martial Art Effectiveness';
  if (line.includes('Jian')) return 'Sword Martial Art Effectiveness';
  if (line.includes('Qiang')) return 'Spear Martial Art Effectiveness';
  if (line.includes('Shan')) return 'Fan Martial Art Effectiveness';
  if (line.includes('Sheng') || line.includes('Biao')) return 'Rope Dart Martial Art Effectiveness';
  if (line.includes('Mo')) return 'Great Blade Martial Art Effectiveness';
  if (line.includes('Shuang')) return 'Dual Blades Martial Art Effectiveness';
  if (line.includes('Heng')) return 'Sabre Martial Art Effectiveness';
  if (line.includes('Shou') || line.includes('Jia')) return 'Fist Martial Art Effectiveness';

  // LLei
  if (line.includes('Jing') || line.includes('Zhun')) return 'Accuracy';
  if (line.includes('Hui') && (line.includes('Xin') || line.includes('Ji'))) return 'Crit Rate';
  if (line.includes('Hui') || line.includes('Yi')) return 'Insight Rate';

  // DanZiShuXing（JinMinShi）- OCR ChangJianCuoWuBianTi
  if (!isLastLine && (
    line.includes('Strength') || line.includes('Ji') || line.includes('Wei') ||
    line.includes('Fei') || line.includes('You') || line.includes('Tan')
  )) return 'Strength';
  if (line.includes('Agility') || line.includes('Kao')) return 'Agility';
  if (line.includes('Momentum')) return 'Momentum';

  // Lei Penetration
  if ((line.includes('Wai') && line.includes('Chuan')) ||
      (line.includes('GongChuan') && !line.includes('Shu') && !line.includes('None'))) {
    return 'Outer Penetration';
  }
  if ((line.includes('Shu') || line.includes('None')) && line.includes('Chuan')) {
    return 'Elemental Penetration';
  }

  // GongJiLei（DaiDaXiaoQuFen）
  if (line.includes('XiaoWai')) return 'Min Outer Attack';
  if (line.includes('DaWai')) return 'Max Outer Attack';
  if ((line.includes('Ming') && line.includes('Xiao')) || (line.includes('Jin') && line.includes('Xiao'))) return 'Min Mingjin Attack';
  if ((line.includes('Ming') && line.includes('Da')) || (line.includes('Jin') && line.includes('Da'))) return 'Max Mingjin Attack';
  if ((line.includes('Lie') && line.includes('Xiao')) || (line.includes('Shi') && line.includes('Xiao'))) return 'Min Lie Shi Attack';
  if ((line.includes('Lie') && line.includes('Da')) || (line.includes('Shi') && line.includes('Da'))) return 'Max Lie Shi Attack';
  if ((line.includes('Qian') && line.includes('Xiao')) || (line.includes('Si') && line.includes('Xiao'))) return 'Min Qian Si Attack';
  if ((line.includes('Qian') && line.includes('Da')) || (line.includes('Si') && line.includes('Da'))) return 'Max Qian Si Attack';
  if ((line.includes('Guo') && line.includes('Xiao')) || (line.includes('Si') && line.includes('Xiao'))) return 'Min Qian Si Attack'; // OCR: GuoSi
  if ((line.includes('Guo') && line.includes('Da')) || (line.includes('Si') && line.includes('Da'))) return 'Max Qian Si Attack'; // OCR: GuoSi
  if ((line.includes('Po') && line.includes('Xiao')) || (line.includes('Zhu') && line.includes('Xiao'))) return 'Min Po Zhu Attack';
  if ((line.includes('Po') && line.includes('Da')) || (line.includes('Zhu') && line.includes('Da'))) return 'Max Po Zhu Attack';
  if ((line.includes('None') && line.includes('Xiao')) || (line.includes('Xiang') && line.includes('Xiao'))) return 'ZuiXiaoNoneXiangGongJi';
  if ((line.includes('None') && line.includes('Da')) || (line.includes('Xiang') && line.includes('Da'))) return 'ZuiDaNoneXiangGongJi';

  // DouDi：JianCeDaoShuGongGuanJianZiMoRenZuiDa
  if (line.includes('Ming') || line.includes('Jin')) return 'Max Mingjin Attack';
  if (line.includes('Lie') || line.includes('Shi')) return 'Max Lie Shi Attack';
  if (line.includes('Qian') || line.includes('Si') || line.includes('Guo')) return 'Max Qian Si Attack';
  if (line.includes('Po') || line.includes('Zhu')) return 'Max Po Zhu Attack';
  if (line.includes('None') || line.includes('Xiang')) return 'ZuiDaNoneXiangGongJi';
  if (line.includes('Wai') || line.includes('Gong')) return 'Max Outer Attack';

  // ShengCunLei
  if (line.includes('Qi') || line.includes('Xue') || line.includes('Zhi') ||
      line.includes('Fang') || line.includes('Yu') || line.includes('Ti')) return 'ShengCunLeiAffix';

  return null;
}

/**
 * JieXiDanHangOCRWenBen，TiQuAffixLeiXingHeShuZhi
 */
function parseStatLine(line: string, isLastLine: boolean = false): ParsedStat | null {
  // JianChaShiFouShiZhuanLAffix
  const isConverted =
    line.includes('[Zhuan]') ||
    line.includes('【Zhuan】') ||
    line.includes('Zhuan]') ||
    line.includes('[Zhuan');

  // QingXiWenBen
  let cleanLine = cleanOcrLine(line);

  // YiChu [Zhuan] BiaoJi
  cleanLine = cleanLine
    .replace(/\[Zhuan\]/g, '')
    .replace(/【Zhuan】/g, '')
    .replace(/\[Zhuan1?\]/g, '')
    .replace(/Zhuan\]/g, '')
    .replace(/\[Zhuan/g, '');

  // ShiYongZhiNengPiPei
  let matchedStatType = smartMatchStatName(cleanLine, isLastLine);

  // RuGuoPiPeiDaoBieMing，ZhuanHuanWeiBiaoZhunMingCheng
  if (matchedStatType && STAT_ALIASES[matchedStatType]) {
    matchedStatType = STAT_ALIASES[matchedStatType];
  }

  if (!matchedStatType) {
    console.log('[OCR] Failed to match stat name in line:', line, '-> cleaned:', cleanLine);
  }

  // TiQuShuZhi
  const value = extractValue(line, matchedStatType || '');

  if (value === null) {
    console.log('[OCR] Failed to extract value from line:', line);
    return null;
  }

  const finalType = matchedStatType || '';
  console.log('[OCR] Parsed stat:', { type: finalType, value, isConverted, originalLine: line });

  return {
    type: finalType,
    value,
    isConverted,
  };
}

/**
 * TiQuShuZhi（CanKao spongem ShiXianDeShuZhiChuLiLuoJi）
 */
function extractValue(line: string, statName: string): number | null {
  // TiQuYuanShiShuZi
  const match = line.match(/(\d+(\.\d+)?)/);
  if (!match) return null;

  let statVal = match[0];
  const pureDigits = statVal.replace(/\./g, '');

  // ShuZiTaiDuan，KeNengShiZaoSheng
  if (pureDigits.length < 2) return null;

  // PanDuanShiFouShiBaiFenBiLeiXing
  const isPercentType = ['L', ' Damage Bonus', ' Effectiveness', 'JiaCheng', ' Penetration'].some((k) => statName.includes(k));

  if (isPercentType) {
    // BaiFenBiLeiXingChuLi
    const d1 = pureDigits[0];
    const d2 = pureDigits[1];
    statVal = `${d1}.${d2}`;
    // TeShuChuLi：RuGuoShi 113 -> 11.3（Zhen Dui Deng Ke Neng Chao Guo Penetration10DeShuZhi）
    if (pureDigits.length >= 3 && d1 === '1') {
      statVal = `${pureDigits.slice(0, 2)}.${pureDigits.slice(2)}`;
    }
  } else {
    // ShuZhiLei（GongJiLi、JinMinShi）
    if (pureDigits.length >= 3) {
      statVal = `${pureDigits.slice(0, 2)}.${pureDigits.slice(2, 3)}`;
    } else {
      statVal = `${pureDigits[0]}.${pureDigits[1]}`;
    }
    if (pureDigits.length === 4) {
      statVal = `${pureDigits[0]}${pureDigits[2]}.${pureDigits[3]}`;
    }
  }

  const result = parseFloat(statVal);

  // GongJiLiShuZhiTaiXiao，KeNengShiBieCuoWu
  if (statName.includes('GongJi') && result < 1.0) return null;

  return result;
}

/**
 * MoHuPiPeiAffixMingCheng（ChuLiOCRShiBieCuoWu）
 */
function fuzzyMatchStatName(text: string): string | null {
  // ChangJianDeGuanJianCiPiPei
  const keywordMappings: Record<string, string> = {
    'WaiGongGongJi': 'Max Outer Attack',
    'NoneXiangGongJi': 'ZuiDaNoneXiangGongJi',
    'MingJinGongJi': 'Max Mingjin Attack',
    'LieShiGongJi': 'Max Lie Shi Attack',
    'QianSiGongJi': 'Max Qian Si Attack',
    'PoZhuGongJi': 'Max Po Zhu Attack',
    'Wu Xue Effectiveness': 'All Martial Arts Effectiveness',
    'Wu Xue Damage Bonus': 'All Martial Arts Effectiveness',
    'ShouLing': 'Boss Damage Bonus',
  };

  for (const [keyword, statName] of Object.entries(keywordMappings)) {
    if (text.includes(keyword)) {
      return statName;
    }
  }

  // DanZiFuAffixPiPei
  if (/^Strength\s*\d/.test(text) || text === 'Strength') return 'Strength';
  if (/^Agility\s*\d/.test(text) || text === 'Agility') return 'Agility';
  if (/^Momentum\s*\d/.test(text) || text === 'Momentum') return 'Momentum';

  return null;
}


/**
 * JieXiOCRShiBieDeWenBen，TiQuEquipmentAffix
 */
export function parseOcrText(text: string, slotId: string, weaponTypeId?: string): OcrParseResult {
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  const result: OcrParseResult = {
    subStats: [],
  };

  const parsedStats: ParsedStat[] = [];

  console.log('[OCR] Parsing lines:', lines);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLastLine = i === 5; // Di6Xing（SuoYin5）ShiDingyin Affix
    const stat = parseStatLine(line, isLastLine);
    if (stat) {
      parsedStats.push(stat);
    }
  }

  console.log('[OCR] Parsed stats:', parsedStats);

  // HuoQuDangQianEquipmentWeiZhiDeKeYongAffix
  const mainStatOptions = CommonData.MAIN_STAT_RULES[slotId] || [];
  const dingyinOptions = CommonData.DINGYIN_RULES[slotId] || ['None'];

  // HuoQuKeYongDeSecondary AffixLieBiao
  let subStatOptions = [...CommonData.BASE_SUB_STATS];
  if (slotId === '1' && weaponTypeId) {
    const weapon = CommonData.WEAPON_TYPES.find((w) => w.id === weaponTypeId);
    if (weapon) subStatOptions.push(weapon.stat);
  }
  if (['3', '4'].includes(slotId)) subStatOptions.push('All Martial Arts Effectiveness');
  if (['5', '6'].includes(slotId)) {
    subStatOptions.push('Singletarget Technique Damage Bonus');
    subStatOptions.push('AoE Technique Damage Bonus');
  }
  if (['7', '8'].includes(slotId)) subStatOptions.push('Boss Damage Bonus');
  subStatOptions.push('ShengCunLeiAffix');

  // AnWeiZhiFenPeiAffix：
  // - Di1Tiao = Primary Affix
  // - Di2-5Tiao = Secondary Affix（4Tiao）
  // - Di6Tiao = Dingyin Affix（RuGuoYou6TiaoDeHua）
  for (let i = 0; i < parsedStats.length; i++) {
    const stat = parsedStats[i];

    // JiLuDiYiGeZhuanLAffix（YongYuPanDuanShiFouYouZhuanL）
    if (stat.isConverted && !result.convertedStat) {
      result.convertedStat = stat;
    }

    if (i === 0) {
      // Di1Tiao = Primary Affix
      result.mainStat = stat;
    } else if (i >= 1 && i <= 4) {
      // Di2-5Tiao = Secondary Affix
      result.subStats.push(stat);
    } else if (i === 5) {
      // Di6Tiao = Dingyin Affix
      result.dingyinStat = stat;
    }
  }

  console.log('[OCR] Final result:', result);

  return result;
}

/**
 * WanZhengDeOCRShiBieLiuCheng
 */
export async function ocrEquipmentStats(
  imageSource: File,
  slotId: string,
  weaponTypeId?: string
): Promise<OcrParseResult> {
  const text = await recognizeImage(imageSource);
  console.log('[OCR] Recognized text:', text);
  return parseOcrText(text, slotId, weaponTypeId);
}
