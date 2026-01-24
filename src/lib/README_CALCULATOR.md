# 核心计算器集成说明

## 概述

本项目已完全集成了来自 http://spongem.com/yysls/js/core/calculator.js 的核心计算算法。

## 文件结构

### 核心文件

1. **`coreCalculator.ts`** - 核心计算器实现
   - `CoreCalculator` 类：包含 `calculateTotal` 和 `calculateGraduationRate` 方法
   - 完全基于原 JavaScript 代码转换为 TypeScript

2. **`commonData.ts`** - 游戏基础数据
   - `BASE_STATS` - 基础属性定义
   - `XINFA_DATA` - 心法数据（需要填充）
   - `SET_DATA` - 套装数据（需要填充）

3. **`classConfig.ts`** - 流派配置
   - `ROTATIONS` - 各流派的技能循环配置

4. **`calculatorAdapter.ts`** - 数据适配层
   - 将项目中的 `Equipment`/`Affix` 数据结构转换为计算器需要的格式

5. **`calculator.ts`** - 对外接口
   - 保留原有的接口函数（向后兼容）
   - 新增 `calculateGraduationRateWithCore` 使用核心算法

## 使用方法

### 基础用法

```typescript
import { coreCalculator } from '@/lib/coreCalculator';
import { convertEquipmentsToCalculatorFormat } from '@/lib/calculatorAdapter';

// 1. 转换装备格式
const calculatorEquipments = convertEquipmentsToCalculatorFormat(equipments, equippedIds);

// 2. 计算面板属性
const totalStats = coreCalculator.calculateTotal(
  calculatorEquipments,
  xinfa,           // 流派
  'precision',     // 弓诀类型: 'precision' | 'crit' | 'intent'
  [xinfa],         // 心法列表
  neiGong,         // 套装名称
  false,           // debug
  null,            // statModifier
  false            // earlySeasonBonus
);

// 3. 计算毕业率（需要技能数据库和循环）
const result = coreCalculator.calculateGraduationRate(
  params,          // 面板属性参数
  skillDb,         // 技能数据库
  rotation,        // 技能循环
  baseline,        // 基准值
  false            // debug
);
```

### 使用封装函数

```typescript
import { calculateGraduationRateWithCore } from '@/lib/calculator';

const result = calculateGraduationRateWithCore(
  equipments,
  equippedIds,
  xinfa,
  gongJue,
  neiGong,
  skillDb,
  rotation,
  baseline,
  useNextSeason
);
```

## 待完成事项

### 1. 数据填充

以下数据需要从原网站或游戏数据中获取并填充：

- **`XINFA_DATA`** (`src/lib/commonData.ts`)
  - 各心法的属性加成数据
  
- **`SET_DATA`** (`src/lib/commonData.ts`)
  - 各套装的属性加成数据

- **`ROTATIONS`** (`src/lib/classConfig.ts`)
  - 各流派的技能循环配置（包括 `useTime` 等）

### 2. 技能数据库

`calculateGraduationRate` 需要技能数据库（`skillDb`），包含：
- 技能名称
- 技能类型、武器类型、元素
- 倍率、固伤
- 特殊效果、修饰符等

### 3. 词条类型映射

`calculatorAdapter.ts` 中的 `AFFIX_TYPE_MAP` 需要完善，确保所有词条类型都能正确映射到计算器需要的格式。

### 4. 槽位映射

`getSlotIdFromSlot` 函数中的槽位映射可能需要根据实际游戏逻辑调整。

## 注意事项

1. **数据完整性**：核心算法需要完整的数据支持，包括心法、套装、技能数据库等
2. **类型安全**：部分动态属性访问使用了 `any` 类型，这是为了兼容原 JavaScript 代码的灵活性
3. **性能优化**：计算器实现了缓存机制，当流派、心法、套装等配置改变时会自动清除缓存
4. **调试模式**：所有计算函数都支持 `debug` 参数，可以输出详细的计算过程

## 参考

- 原算法来源：http://spongem.com/yysls/js/core/calculator.js
- 原网站：http://spongem.com/yysls/
