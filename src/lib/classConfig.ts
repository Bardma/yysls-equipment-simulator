/**
 * 流派配置数据
 * 基于 http://spongem.com/yysls/data/class_config.js
 */

import { SkillData, type SkillDatabase } from "./skillData";

// 流派列表
export const CLASSES: string[] = [
  "破竹尘",
  "破竹鸢",
  "鸣金虹",
  "鸣金影",
  "破竹风",
  "裂石威",
  "裂石钧（双切）",
  "裂石钧（纯唐）",
  "牵丝霖",
  "牵丝玉",
];

// 武器规则：各流派允许的武器类型ID
export const WEAPON_RULES: Record<string, string[]> = {
  破竹尘: ["5"], // 绳标
  破竹鸢: ["4"], // 扇
  鸣金虹: ["1"], // 剑
  鸣金影: ["1"], // 剑
  破竹风: ["5"], // 绳标
  裂石威: ["9"], // 拳甲
  "裂石钧（双切）": ["6", "7"], // 双刀, 陌刀
  "裂石钧（纯唐）": ["7"], // 陌刀
  牵丝霖: ["2"], // 枪
  牵丝玉: ["3"], // 伞
};

// 默认套装
export const DEFAULT_SETS: Record<string, string> = {
  破竹尘: "连星",
  破竹鸢: "连星",
  鸣金虹: "浣花",
  鸣金影: "玉斗",
  破竹风: "连星",
  裂石威: "撼天",
  "裂石钧（双切）": "燕归",
  "裂石钧（纯唐）": "燕归",
  牵丝霖: "烟柳",
  牵丝玉: "浣花",
};

// 心法规则
export interface XinfaRuleConfig {
  default: string[];
  extra: string[];
}

export const XINFA_RULES: Record<string, XinfaRuleConfig> = {
  破竹尘: {
    default: ["心弥泥鱼", "绳舟行木"],
    extra: ["君臣药", "花上月令", "霜天白夜", "三穷致知"],
  },
  破竹鸢: {
    default: ["心弥泥鱼", "绳舟行木"],
    extra: ["扶摇直上", "千丝蛊", "孤忠不辞", "纵地摘星"],
  },
  鸣金虹: {
    default: ["凝神章", "移经易武"],
    extra: ["剑气纵横", "忘川绝响", "千山法", "春雷篇"],
  },
  鸣金影: {
    default: ["凝神章", "移经易武"],
    extra: ["剑气纵横", "忘川绝响", "千山法", "春雷篇"],
  },
  破竹风: {
    default: ["心弥泥鱼", "绳舟行木"],
    extra: ["扶摇直上", "花上月令", "孤忠不辞", "纵地摘星"],
  },
  裂石威: {
    default: ["抗造大法", "穿喉决"],
    extra: ["千营一呼", "山河绝韵", "威猛歌", "逐狼心经"],
  },
  "裂石钧（双切）": {
    default: ["抗造大法", "穿喉决"],
    extra: ["大唐歌", "断石之构", "灯儿亮", "擒天势"],
  },
  "裂石钧（纯唐）": {
    default: ["抗造大法", "穿喉决"],
    extra: ["大唐歌", "断石之构", "灯儿亮", "擒天势"],
  },
  牵丝霖: {
    default: ["杏花不见"],
    extra: ["无名心法", "千丝蛊", "孤忠不辞", "纵地摘星"],
  },
  牵丝玉: {
    default: ["杏花不见"],
    extra: ["无名心法", "千丝蛊", "孤忠不辞", "纵地摘星"],
  },
};

// 锁定心法：固定在特定槽位的心法
export const XINFA_LOCKED: Record<string, string[]> = {
  破竹尘: ["心弥泥鱼", "绳舟行木"],
  破竹鸢: ["心弥泥鱼", "绳舟行木"],
  鸣金虹: ["凝神章", "移经易武"],
  鸣金影: ["凝神章", "移经易武"],
  破竹风: ["心弥泥鱼", "绳舟行木"],
  裂石威: ["抗造大法", "穿喉决"],
  "裂石钧（双切）": ["抗造大法", "穿喉决"],
  "裂石钧（纯唐）": ["抗造大法", "穿喉决"],
  牵丝霖: ["杏花不见"],
  牵丝玉: ["杏花不见"],
};

// 技能循环动作
export interface RotationAction {
  name: string;
  count: number;
  isDingyin: boolean;
  generalBonus: boolean;
  included: boolean;
  yishui?: number;
}

// 流派循环配置
export interface RotationConfig {
  rotation: RotationAction[];
  baseline: number;
  useTime: number;
  version: string;
  author: string;
  skillDatabase: SkillDatabase;
  updateTime: string;
}

// 完整循环配置
export const ROTATIONS: Record<string, RotationConfig> = {
  破竹尘: {
    rotation: [
      {
        name: "尘绳标Q(失魂)",
        count: 14,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "尘流韵(失魂)",
        count: 1,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "尘流韵HIT(失魂)",
        count: 11,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "摩诃*7(失魂)",
        count: 7,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "摩诃*8(失魂)",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "尘余韵(失魂)",
        count: 20,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "尘归鸿(失魂)",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "尘归鸿HIT(失魂)",
        count: 22,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "绳标精通",
        count: 83,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
      {
        name: "蓄劲",
        count: 17,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 4244078.11,
    useTime: 55.5,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData.破竹尘,
    updateTime: "2025-01-18",
  },
  破竹鸢: {
    rotation: [
      {
        name: "鸢扇Q(失魂)",
        count: 15,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "鸢流韵(失魂)",
        count: 1,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "鸢流韵HIT(失魂)",
        count: 11,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "摩诃*7(失魂)",
        count: 7,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "摩诃*8(失魂)",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "鸢余韵(失魂)",
        count: 20,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "鸢归鸿(失魂)",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "鸢归鸿HIT(失魂)",
        count: 22,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "扇精通",
        count: 83,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
      {
        name: "蓄劲",
        count: 17,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 4244078.11,
    useTime: 55.5,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData.破竹鸢,
    updateTime: "2025-01-18",
  },
  鸣金虹: {
    rotation: [
      {
        name: "虹剑Q(气盛)",
        count: 24,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "奏绝(气盛)",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "奏绝HIT(气盛)",
        count: 19,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "虹纵(气盛)",
        count: 3,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "虹御(气盛)",
        count: 1,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "虹钟(气盛)",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "虹钟HIT(气盛)",
        count: 25,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "金音*4(气盛)",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "金音*5(气盛)",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "金音*6(气盛)",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "剑精通",
        count: 90,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 3863287.21,
    useTime: 55,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData.鸣金虹,
    updateTime: "2025-01-18",
  },
  鸣金影: {
    rotation: [
      {
        name: "影剑Q(气盛)",
        count: 25,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "奏绝(气盛)",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "奏绝HIT(气盛)",
        count: 19,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "影纵(气盛)",
        count: 3,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "影御(气盛)",
        count: 1,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "影钟(气盛)",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "影钟HIT(气盛)",
        count: 25,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "金音*4(气盛)",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "金音*5(气盛)",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "金音*6(气盛)",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "剑精通",
        count: 91,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 3636815.48,
    useTime: 51.5,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData.鸣金影,
    updateTime: "2025-01-18",
  },
  破竹风: {
    rotation: [
      {
        name: "风绳标Q(失魂)",
        count: 12,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "风一苇(失魂)",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "风一苇HIT(失魂)",
        count: 12,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "风余韵(失魂)",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "风归鸿(失魂)",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "风归鸿HIT(失魂)",
        count: 8,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "绳标精通",
        count: 44,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
      {
        name: "蓄劲",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 1493936.08,
    useTime: 20.8,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData.破竹风,
    updateTime: "2025-01-18",
  },
  裂石威: {
    rotation: [
      {
        name: "威拳甲Q",
        count: 15,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "威迸裂",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "威迸裂HIT",
        count: 30,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "威碎岩*5",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "威碎岩*6",
        count: 5,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "威碎岩*7",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "威刹那",
        count: 12,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "威刹那HIT",
        count: 60,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "拳甲精通",
        count: 107,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 3827330.09,
    useTime: 53.5,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData.裂石威,
    updateTime: "2025-01-18",
  },
  "裂石钧（双切）": {
    rotation: [
      {
        name: "钧双刀Q",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "钧陌刀Q",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "钧回风",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "钧回风HIT",
        count: 28,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "钧碎岩",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "双刀精通",
        count: 22,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
      {
        name: "陌刀精通",
        count: 22,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 1481355.87,
    useTime: 21.5,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData["裂石钧（双切）"],
    updateTime: "2025-01-18",
  },
  "裂石钧（纯唐）": {
    rotation: [
      {
        name: "钧陌刀Q",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "钧回风",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "钧回风HIT",
        count: 14,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "钧碎岩",
        count: 2,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "陌刀精通",
        count: 22,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 958174.75,
    useTime: 14,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData["裂石钧（纯唐）"],
    updateTime: "2025-01-18",
  },
  牵丝霖: {
    rotation: [
      {
        name: "霖枪Q(飞雀)",
        count: 8,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "霖天雨",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "霖天雨HIT",
        count: 32,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "霖乱花",
        count: 8,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "霖乱花HIT",
        count: 16,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "霖疾羽",
        count: 8,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "霖疾羽HIT",
        count: 24,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "枪精通",
        count: 64,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 2217024.42,
    useTime: 30,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData.牵丝霖,
    updateTime: "2025-01-18",
  },
  牵丝玉: {
    rotation: [
      {
        name: "玉伞Q(飞雀)",
        count: 14,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "玉天雨",
        count: 4,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "玉天雨HIT",
        count: 39,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "玉乱花",
        count: 8,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "玉乱花HIT",
        count: 12,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "玉疾羽",
        count: 8,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "玉疾羽HIT",
        count: 24,
        isDingyin: false,
        generalBonus: true,
        included: true,
      },
      {
        name: "伞精通",
        count: 105,
        isDingyin: true,
        generalBonus: true,
        included: true,
      },
    ],
    baseline: 3519988.71,
    useTime: 49.5,
    version: "v25.01.18",
    author: "Calcifer",
    skillDatabase: SkillData.牵丝玉,
    updateTime: "2025-01-18",
  },
};

// 导出完整的 ClassConfig 对象
export const ClassConfig = {
  CLASSES,
  WEAPON_RULES,
  DEFAULT_SETS,
  XINFA_RULES,
  XINFA_LOCKED,
  ROTATIONS,
};
