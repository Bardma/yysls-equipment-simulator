# 燕云十六声装备毕业率管理器

一个用于管理《燕云十六声》游戏装备、计算毕业率的 Web 应用，使用 Next.js 14+ 构建。

## 功能特性

### 角色管理

- 创建、切换、删除角色
- 每个角色独立的装备数据

### 装备管理

- 录入装备（支持武器、环、佩、冠胄、胸甲、胫甲、腕甲）
- 主词条、副词条（4条）、定音词条
- 承音、紫装、可转律等属性标记
- OCR 文字识别快速录入

### 穿戴模拟

- 8 个装备槽位配置
- 心法选择（鸣金虹、破竹尘等）
- 弓诀选择（精准弓、会心弓、会意弓）
- 内功选择

### 毕业率计算

- 实时计算当前配装毕业率
- Excel 等级对照显示（SSS/SS/S/A/B/C/D/E）
- 轴期望秒伤估算

### 毕业率分析

- 装备收益分析
- 词条优先级排名
- 培养方向建议

### 数据管理

- 导出/导入 JSON 数据
- 数据持久化（localStorage）

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: shadcn/ui
- **状态管理**: Zustand
- **OCR**: Tesseract.js
- **存储**: localStorage

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm run start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面
│   └── globals.css         # 全局样式
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   ├── header/             # 顶部导航
│   ├── equipment/          # 装备相关组件
│   ├── simulation/         # 穿戴模拟组件
│   ├── graduation/         # 毕业率显示
│   └── modals/             # 弹窗组件
├── stores/                 # Zustand 状态管理
│   ├── characterStore.ts
│   ├── equipmentStore.ts
│   └── simulationStore.ts
├── lib/                    # 工具库
│   ├── calculator.ts       # 毕业率计算
│   ├── constants.ts        # 常量定义
│   └── utils.ts            # 工具函数
└── types/                  # TypeScript 类型定义
    └── index.ts
```

## 使用说明

1. **创建角色**: 点击右上角「+ 新建角色」按钮
2. **录入装备**: 点击「+ 录入装备」按钮，填写装备信息
3. **穿戴模拟**: 在右侧面板选择每个槽位的装备
4. **查看毕业率**: 实时显示当前配装的毕业率
5. **详细分析**: 点击「详细分析」查看词条优先级和培养建议

## 参考

- 原网站: http://spongem.com/yysls/

## License

MIT
