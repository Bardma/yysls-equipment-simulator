'use client';

import { createWorker, PSM } from 'tesseract.js';

import { CommonData } from './data/commonData';

// Tesseract Worker 实例
let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
let isInitializing = false;

/**
 * 获取或创建 Tesseract Worker
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

    worker = await createWorker('chi_sim+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
        } else {
          console.log('[OCR]', m.status);
        }
      },
    });

    // 设置识别参数
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
 * 使用 Tesseract.js 进行 OCR 识别（直接使用原始图片，不做预处理）
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
  isConverted?: boolean; // 是否是转律词条 [转]
}

export interface OcrParseResult {
  mainStat?: ParsedStat;
  subStats: ParsedStat[];
  dingyinStat?: ParsedStat;
  convertedStat?: ParsedStat; // 转律后的词条
}

// 全局干扰词配置（OCR 常见错误识别）
const GLOBAL_ARTIFACTS = [
  '医国', '国国', '攻强', '项国', '匡恒', '匡强', '医强',
  '国强', '匡国', '回国', '福强', '医弹',
  '荐', 'I', 'l', '。', '1，', '1,',
];

// 行首干扰词
const START_ARTIFACTS = ['，', ',', '+，', '+,', '.', ':', '1,', '心'];

// 词条别名映射（OCR 错误 -> 正确名称）
const STAT_ALIASES: Record<string, string> = {
  '无相穿透': '属攻穿透',
  '外功攻击': '最大外功攻击',
  '最大外功': '最大外功攻击',
  '最小外功': '最小外功攻击',
  '纪国': '劲',
  '纪': '劲',
  '红': '劲',
  '国': '劲',
  '力': '劲',
  '妃': '劲',
  '苇': '劲',
  '苇功国': '最大外功攻击',
  '拳甲增效': '拳甲武学增效',
  '会心计': '会心率',
  '过丝': '牵丝',
};

// 定音词条列表
const DINGYIN_STATS = ['外功穿透', '属攻穿透', '指定武学技能增伤'];

const normalizeEnText = (line: string): string =>
  line
    .toLowerCase()
    .replace(/[^a-z0-9%+\.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ENGLISH_STAT_MAPPINGS: Array<[string, string]> = [
  ['precision rate', '精准率'],
  ['critical rate', '会心率'],
  ['affinity rate', '会意率'],
  ['direct critical rate', '直接会心率'],
  ['direct affinity rate', '直接会意率'],
  ['critical dmg bonus', '会心伤害加成'],
  ['affinity dmg bonus', '会意伤害加成'],
  ['physical penetration', '外功穿透'],
  ['attribute attack penetration', '属攻穿透'],
  ['attribute penetration', '属攻穿透'],
  ['physical attack', '最大外功攻击'],
  ['attribute attack', '最大无相攻击'],
  ['formless attribute', '最大无相攻击'],
  ['bellstrike attack', '最大鸣金攻击'],
  ['stonesplit attack', '最大裂石攻击'],
  ['silkbind attack', '最大牵丝攻击'],
  ['bamboocut attack', '最大破竹攻击'],
  ['body', '劲'],
  ['power', '劲'],
  ['agility', '敏'],
  ['momentum', '势'],
  ['all martial bonus', '全武学增效'],
  ['all weapon bonus', '全武学增效'],
  ['boss damage bonus', '对首领单位增伤'],
  ['single target', '单体类奇术增伤'],
  ['aoe', '群体类奇术增伤'],
  ['sword bonus', '剑武学增效'],
  ['spear bonus', '枪武学增效'],
  ['umbrella bonus', '伞武学增效'],
  ['fan bonus', '扇武学增效'],
  ['rope dart bonus', '绳标武学增效'],
  ['dual blades bonus', '双刀武学增效'],
  ['modao bonus', '陌刀武学增效'],
  ['teng dao bonus', '横刀武学增效'],
  ['gauntlets bonus', '拳甲武学增效'],
];

function smartMatchEnglishStatName(line: string): string | null {
  const normalized = normalizeEnText(line);
  if (!normalized) return null;

  for (const [keyword, statName] of ENGLISH_STAT_MAPPINGS) {
    if (normalized.includes(keyword)) return statName;
  }

  if (normalized.includes('min') && normalized.includes('physical attack')) return '最小外功攻击';
  if (normalized.includes('max') && normalized.includes('physical attack')) return '最大外功攻击';
  if (normalized.includes('min') && normalized.includes('attribute attack')) return '最小无相攻击';
  if (normalized.includes('max') && normalized.includes('attribute attack')) return '最大无相攻击';
  if (normalized.includes('min') && normalized.includes('bellstrike attack')) return '最小鸣金攻击';
  if (normalized.includes('max') && normalized.includes('bellstrike attack')) return '最大鸣金攻击';
  if (normalized.includes('min') && normalized.includes('stonesplit attack')) return '最小裂石攻击';
  if (normalized.includes('max') && normalized.includes('stonesplit attack')) return '最大裂石攻击';
  if (normalized.includes('min') && normalized.includes('silkbind attack')) return '最小牵丝攻击';
  if (normalized.includes('max') && normalized.includes('silkbind attack')) return '最大牵丝攻击';
  if (normalized.includes('min') && normalized.includes('bamboocut attack')) return '最小破竹攻击';
  if (normalized.includes('max') && normalized.includes('bamboocut attack')) return '最大破竹攻击';

  return null;
}


/**
 * 清洗 OCR 文本，移除干扰词
 */
function cleanOcrLine(line: string): string {
  let cleanLine = line.replace(/\s+/g, '');

  // 移除全局干扰词
  for (const artifact of GLOBAL_ARTIFACTS) {
    cleanLine = cleanLine.split(artifact).join('');
  }

  // 特殊替换：| -> 劲
  cleanLine = cleanLine.replace(/\|/g, '劲');

  // 移除行首干扰词
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
    // 去除行首数字
    if (/^\d+[，,]?/.test(cleanLine)) {
      cleanLine = cleanLine.replace(/^\d+[，,]?/, '');
      hasGarbage = true;
    }
  }

  return cleanLine;
}

/**
 * 基于规则的词条匹配（参考 spongem 实现）
 * 使用简单的 includes 判断，更灵活地处理 OCR 错误
 */
function smartMatchStatName(line: string, isLastLine: boolean = false): string | null {
  // 优先匹配长词条/特殊词条
  if (line.includes('指定') && line.includes('增伤')) return '指定武学技能增伤';
  // 最后一行且含增伤/技，兜底为指定武学技能增伤
  if (isLastLine && (line.includes('增伤') || line.includes('技'))) return '指定武学技能增伤';

  if (line.includes('首') || line.includes('领')) return '对首领单位增伤';

  // 武学增效类
  if (line.includes('全')) return '全武学增效';
  if (line.includes('单') || (line.includes('体') && line.includes('奇'))) return '单体类奇术增伤';
  if (line.includes('群')) return '群体类奇术增伤';
  if (line.includes('伞')) return '伞武学增效';
  if (line.includes('剑')) return '剑武学增效';
  if (line.includes('枪')) return '枪武学增效';
  if (line.includes('扇')) return '扇武学增效';
  if (line.includes('绳') || line.includes('标')) return '绳标武学增效';
  if (line.includes('陌')) return '陌刀武学增效';
  if (line.includes('双')) return '双刀武学增效';
  if (line.includes('横')) return '横刀武学增效';
  if (line.includes('手') || line.includes('甲')) return '拳甲武学增效';

  // 率类
  if (line.includes('精') || line.includes('准')) return '精准率';
  if (line.includes('会') && (line.includes('心') || line.includes('计'))) return '会心率';
  if (line.includes('会') || line.includes('意')) return '会意率';

  // 单字属性（劲敏势）- OCR 常见错误变体
  if (!isLastLine && (
    line.includes('劲') || line.includes('纪') || line.includes('苇') ||
    line.includes('妃') || line.includes('幼') || line.includes('弹')
  )) return '劲';
  if (line.includes('敏') || line.includes('考')) return '敏';
  if (line.includes('势')) return '势';

  // 穿透类
  if ((line.includes('外') && line.includes('穿')) ||
      (line.includes('攻穿') && !line.includes('属') && !line.includes('无'))) {
    return '外功穿透';
  }
  if ((line.includes('属') || line.includes('无')) && line.includes('穿')) {
    return '属攻穿透';
  }

  // 攻击类（带大小区分）
  if (line.includes('小外')) return '最小外功攻击';
  if (line.includes('大外')) return '最大外功攻击';
  if ((line.includes('鸣') && line.includes('小')) || (line.includes('金') && line.includes('小'))) return '最小鸣金攻击';
  if ((line.includes('鸣') && line.includes('大')) || (line.includes('金') && line.includes('大'))) return '最大鸣金攻击';
  if ((line.includes('裂') && line.includes('小')) || (line.includes('石') && line.includes('小'))) return '最小裂石攻击';
  if ((line.includes('裂') && line.includes('大')) || (line.includes('石') && line.includes('大'))) return '最大裂石攻击';
  if ((line.includes('牵') && line.includes('小')) || (line.includes('丝') && line.includes('小'))) return '最小牵丝攻击';
  if ((line.includes('牵') && line.includes('大')) || (line.includes('丝') && line.includes('大'))) return '最大牵丝攻击';
  if ((line.includes('过') && line.includes('小')) || (line.includes('丝') && line.includes('小'))) return '最小牵丝攻击'; // OCR: 过丝
  if ((line.includes('过') && line.includes('大')) || (line.includes('丝') && line.includes('大'))) return '最大牵丝攻击'; // OCR: 过丝
  if ((line.includes('破') && line.includes('小')) || (line.includes('竹') && line.includes('小'))) return '最小破竹攻击';
  if ((line.includes('破') && line.includes('大')) || (line.includes('竹') && line.includes('大'))) return '最大破竹攻击';
  if ((line.includes('无') && line.includes('小')) || (line.includes('相') && line.includes('小'))) return '最小无相攻击';
  if ((line.includes('无') && line.includes('大')) || (line.includes('相') && line.includes('大'))) return '最大无相攻击';

  // 兜底：检测到属攻关键字默认最大
  if (line.includes('鸣') || line.includes('金')) return '最大鸣金攻击';
  if (line.includes('裂') || line.includes('石')) return '最大裂石攻击';
  if (line.includes('牵') || line.includes('丝') || line.includes('过')) return '最大牵丝攻击';
  if (line.includes('破') || line.includes('竹')) return '最大破竹攻击';
  if (line.includes('无') || line.includes('相')) return '最大无相攻击';
  if (line.includes('外') || line.includes('功')) return '最大外功攻击';

  // 生存类
  if (line.includes('气') || line.includes('血') || line.includes('值') ||
      line.includes('防') || line.includes('御') || line.includes('体')) return '生存类词条';

  return null;
}

/**
 * 解析单行OCR文本，提取词条类型和数值
 */
function parseStatLine(line: string, isLastLine: boolean = false): ParsedStat | null {
  // 检查是否是转律词条
  const isConverted =
    line.includes('[转]') ||
    line.includes('【转】') ||
    line.includes('转]') ||
    line.includes('[转');

  // 清洗文本
  let cleanLine = cleanOcrLine(line);

  // 移除 [转] 标记
  cleanLine = cleanLine
    .replace(/\[转\]/g, '')
    .replace(/【转】/g, '')
    .replace(/\[转1?\]/g, '')
    .replace(/转\]/g, '')
    .replace(/\[转/g, '');

  // 使用智能匹配（优先英文，再中文）
  let matchedStatType = smartMatchEnglishStatName(cleanLine) || smartMatchStatName(cleanLine, isLastLine);

  // 如果匹配到别名，转换为标准名称
  if (matchedStatType && STAT_ALIASES[matchedStatType]) {
    matchedStatType = STAT_ALIASES[matchedStatType];
  }

  if (!matchedStatType) {
    console.log('[OCR] Failed to match stat name in line:', line, '-> cleaned:', cleanLine);
  }

  // 提取数值
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
 * 提取数值（参考 spongem 实现的数值处理逻辑）
 */
function extractValue(line: string, statName: string): number | null {
  // 提取原始数字
  const match = line.match(/(\d+(\.\d+)?)/);
  if (!match) return null;

  let statVal = match[0];
  const pureDigits = statVal.replace(/\./g, '');

  // 数字太短，可能是噪声
  if (pureDigits.length < 2) return null;

  // 判断是否是百分比类型
  const isPercentType = ['率', '增伤', '增效', '加成', '穿透'].some((k) => statName.includes(k));

  if (isPercentType) {
    // 百分比类型处理
    const d1 = pureDigits[0];
    const d2 = pureDigits[1];
    statVal = `${d1}.${d2}`;
    // 特殊处理：如果是 113 -> 11.3（针对穿透等可能超过10的数值）
    if (pureDigits.length >= 3 && d1 === '1') {
      statVal = `${pureDigits.slice(0, 2)}.${pureDigits.slice(2)}`;
    }
  } else {
    // 数值类（攻击力、劲敏势）
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

  // 攻击力数值太小，可能识别错误
  if (statName.includes('攻击') && result < 1.0) return null;

  return result;
}

/**
 * 模糊匹配词条名称（处理OCR识别错误）
 */
function fuzzyMatchStatName(text: string): string | null {
  // 常见的关键词匹配
  const keywordMappings: Record<string, string> = {
    '外功攻击': '最大外功攻击',
    '无相攻击': '最大无相攻击',
    '鸣金攻击': '最大鸣金攻击',
    '裂石攻击': '最大裂石攻击',
    '牵丝攻击': '最大牵丝攻击',
    '破竹攻击': '最大破竹攻击',
    '武学增效': '全武学增效',
    '武学增伤': '全武学增效',
    '首领': '对首领单位增伤',
  };

  for (const [keyword, statName] of Object.entries(keywordMappings)) {
    if (text.includes(keyword)) {
      return statName;
    }
  }

  // 单字符词条匹配
  if (/^劲\s*\d/.test(text) || text === '劲') return '劲';
  if (/^敏\s*\d/.test(text) || text === '敏') return '敏';
  if (/^势\s*\d/.test(text) || text === '势') return '势';

  return null;
}


/**
 * 解析OCR识别的文本，提取装备词条
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
    const isLastLine = i === 5; // 第6行（索引5）是定音词条
    const stat = parseStatLine(line, isLastLine);
    if (stat) {
      parsedStats.push(stat);
    }
  }

  console.log('[OCR] Parsed stats:', parsedStats);

  // 获取当前装备位置的可用词条
  const mainStatOptions = CommonData.MAIN_STAT_RULES[slotId] || [];
  const dingyinOptions = CommonData.DINGYIN_RULES[slotId] || ['无'];

  // 获取可用的副词条列表
  let subStatOptions = [...CommonData.BASE_SUB_STATS];
  if (slotId === '1' && weaponTypeId) {
    const weapon = CommonData.WEAPON_TYPES.find((w) => w.id === weaponTypeId);
    if (weapon) subStatOptions.push(weapon.stat);
  }
  if (['3', '4'].includes(slotId)) subStatOptions.push('全武学增效');
  if (['5', '6'].includes(slotId)) {
    subStatOptions.push('单体类奇术增伤');
    subStatOptions.push('群体类奇术增伤');
  }
  if (['7', '8'].includes(slotId)) subStatOptions.push('对首领单位增伤');
  subStatOptions.push('生存类词条');

  // 按位置分配词条：
  // - 第1条 = 主词条
  // - 第2-5条 = 副词条（4条）
  // - 第6条 = 定音词条（如果有6条的话）
  for (let i = 0; i < parsedStats.length; i++) {
    const stat = parsedStats[i];

    // 记录第一个转律词条（用于判断是否有转律）
    if (stat.isConverted && !result.convertedStat) {
      result.convertedStat = stat;
    }

    if (i === 0) {
      // 第1条 = 主词条
      result.mainStat = stat;
    } else if (i >= 1 && i <= 4) {
      // 第2-5条 = 副词条
      result.subStats.push(stat);
    } else if (i === 5) {
      // 第6条 = 定音词条
      result.dingyinStat = stat;
    }
  }

  console.log('[OCR] Final result:', result);

  return result;
}

/**
 * 完整的OCR识别流程
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
