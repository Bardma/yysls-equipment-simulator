# Where Winds Meet Equipment Graduation Rate Simulator

<div align="center">

## 🌟 This project is an optimized rebuild based on the original work 🌟

### 📌 [Original Project: http://spongem.com/yysls/](http://spongem.com/yysls/) 📌

**Core graduation rate calculation algorithms, rotation data, and skill formulas are all derived from the original project**

This project optimizes UI/UX and extends functionality based on the original work. Thanks to the original author for their outstanding contribution!

---

</div>

A modern web application for managing equipment and calculating graduation rates for the game "Where Winds Meet" (Where Winds Meet), built with Next.js 16.

## Relationship with the Original Project

- **Core Algorithms**: Graduation rate formulas, DPS calculation logic, skill damage formulas, and other core algorithms are ported from the original project
- **Rotation Data**: Skill rotations and damage coefficients for each build come from the original project and community contributors
- **Game Data**: Equipment stats, Xinfa effects, set bonuses, and other game data reference the original project
- **This Project's Optimizations**: Rebuilt the frontend interface and interaction experience while preserving the original core calculation logic

[ZhongWen](./README.md)

## Overview

This application helps players manage equipment libraries across multiple characters, simulate gear loadouts, and calculate graduation rates in real-time.

## Features

### 🎭 Character Management

- Create, switch, and delete multiple characters
- Independent equipment data and loadout configurations per character

### ⚔️ Equipment Management

- Complete equipment slots: Weapons (dual-wield), Ring, Pendant, Helm, Chest, Legs, Gloves
- Main stat, sub-stats (4 slots), and Dingyin stat entry
- Chengyin equipment, purple gear, and convertible attribute marking
- **OCR text recognition** for quick equipment input (powered by Tesseract.js)
- Image cropping support for precise recognition

### 🎯 Class/Build Support

Full graduation rate calculation support for 9 builds:

- Mingjin Hong (MingJinHong), Mingjin Ying (MingJinYing)
- Pozhu Chen (PoZhuChen), Pozhu Feng (PoZhuFeng), Pozhu Yuan (PoZhuYuan)
- Lieshi Wei (LieShiWei), Lieshi Jun - Dual Cut (LieShiJun·ShuangQie), Lieshi Jun - Pure Tang (LieShiJun·ChunTang)
- Qiansi Lin (QianSiLin), Qiansi Yu (QianSiYu)

### 🎮 Equipment Simulation

- Visual configuration of 8 equipment slots
- Xinfa (Inner Way) selection with 4 slots per build
- Set bonuses (Yudou, Feisun, Shiyu, Lianxing, Hantian, Duanyue, etc.)
- Pre-season bonus options

### 📊 Graduation Rate Calculation

- Precise DPS calculation based on rotation expectations
- Real-time graduation rate percentage display
- Excel grade reference
- Pre-loan Dingyin mode (preview full Dingyin effects in advance)

### 📈 Advanced Analysis Features

- **Stat Priority Ranking**: Analyze each stat's contribution to graduation rate
- **Equipment Comparison**: Compare graduation rate improvements between different gear
- **Cultivation Recommendations**: Suggest stat priorities based on current loadout
- **Optimal Build Calculator**: Automatically search for the highest graduation rate build from your library
- **Transmutation Analysis**: Analyze potential gains from stat transmutation

### 🔍 Equipment Library Search

- Pinyin search support (e.g., type "jq" to search for "JianQi")
- Intelligent matching with Jieba segmentation
- Filter by slot, attributes, and more

### 💾 Data Management

- Export/Import JSON data backups
- Local data persistence (localStorage)
- Generate loadout report images for sharing

### 🎨 UI Features

- Responsive design for desktop and mobile
- Dark theme interface
- Collapsible panels with customizable layout

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui + Radix UI |
| **State Management** | Zustand 5 |
| **OCR** | Tesseract.js 7 |
| **Search** | jieba-wasm + pinyin-pro |
| **Image Processing** | react-image-crop, html2canvas-pro |
| **Storage** | localStorage |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Visit http://localhost:3000

### Production Build

```bash
npm run build
npm run start
```

### Code Formatting

```bash
npm run format
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── common/             # Common components (image cropper, stat display, etc.)
│   ├── equipment/          # Equipment components (cards, library, etc.)
│   ├── simulation/         # Equipment simulation components
│   ├── graduation/         # Graduation rate analysis components
│   ├── layout/             # Layout components (header, panels, etc.)
│   ├── stats/              # Stats display components
│   └── modals/             # Modal components (equipment editor, xinfa selector, etc.)
├── stores/                 # Zustand state management
│   ├── accountStore.ts     # Character/account state
│   ├── equipmentStore.ts   # Equipment library state
│   └── simulationStore.ts  # Simulation configuration state
└── lib/                    # Utility libraries
    ├── calculator/         # Graduation rate calculation core
    ├── data/               # Game data (classes, skills, xinfa, etc.)
    ├── graduation/         # Graduation rate algorithms
    ├── hooks/              # Custom React hooks
    ├── types.ts            # TypeScript type definitions
    ├── ocrParser.ts        # OCR parsing
    ├── storage.ts          # Local storage utilities
    └── utils.ts            # Utility functions
```

## Usage Guide

1. **Create a Character**: Click the "+ New Character" button in the top right corner
2. **Add Equipment**: Click "+ Add Equipment" button, manually enter or use OCR recognition
3. **Select Build**: Choose your current build in the simulation panel on the right
4. **Equip Items**: Click equipment slots to select items to equip
5. **Configure Xinfa**: Click xinfa slots to configure your xinfa loadout
6. **View Graduation Rate**: Real-time display of current loadout's graduation rate and DPS
7. **Detailed Analysis**: Click "Analyze" button to view stat priorities and cultivation recommendations
8. **Generate Report**: Click "Generate Report" to export a loadout image

## Rotation Data Sources

Graduation rate calculations are based on rotation data provided by:

- **Violetta** - Pozhu Chen, Mingjin Hong, Mingjin Ying, Pozhu Feng, Pozhu Yuan, Lieshi Wei, Lieshi Jun (Dual Cut), Qiansi Yu
- **DouShaBao (Doushabao)** - Mingjin Ying
- **QiuXiJun (Qiuxijun)** - Lieshi Jun (Pure Tang), Qiansi Lin

## Roadmap

- [ ] Add QR code to share reports for quick access to reference equipment
- [ ] Visual rotation planning tool
- [ ] Mini Program version (WeChat/Alipay)
- [ ] Game version selection (for international server players)
- [ ] Multi-language support

## Acknowledgments

- Thanks to the creator of the [original project](http://spongem.com/yysls/)
- Thanks to all the rotation data contributors
- Thanks to the Where Winds Meet game community

## License

MIT License

## Disclaimer

This is an unofficial fan project and is not affiliated with the official Where Winds Meet game. All game content and data copyrights belong to the game developers.
