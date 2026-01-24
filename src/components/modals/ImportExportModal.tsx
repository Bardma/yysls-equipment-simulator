'use client';

import { useState, useRef } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { ExportData, Equipment, Affix, EquipmentSlot, WeaponType, SLOT_ID_TO_NAME, WEAPON_ID_TO_NAME } from '@/types';
import { APP_VERSION } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// 原网站数据格式的接口定义
interface LegacyAffix {
  type?: string;
  name?: string;
  value?: number | string;
  isPercent?: boolean;
}

interface LegacyEquipment {
  id?: string | number;
  slot?: string; // 可能是 "1", "3", "武器", "环" 等
  slotId?: string;
  weaponType?: string; // 可能是 "1", "剑" 等
  weaponTypeId?: string;
  name?: string;
  isChengyin?: boolean;
  chengyin?: boolean;
  isPurple?: boolean;
  purple?: boolean;
  canTransfer?: boolean;
  transfer?: boolean;
  isConvertible?: boolean; // 原网站的字段名
  // 支持多种词条命名
  mainAffix?: LegacyAffix;
  main?: LegacyAffix;
  mainStat?: LegacyAffix; // 原网站使用 mainStat
  subAffixes?: LegacyAffix[];
  subs?: LegacyAffix[];
  sub?: LegacyAffix[];
  subStats?: LegacyAffix[]; // 原网站使用 subStats
  dingyin?: LegacyAffix;
  dingyinAffix?: LegacyAffix;
  dingyinStat?: LegacyAffix; // 原网站使用 dingyinStat
}

interface LegacyExportData {
  version?: string;
  exportTime?: number;
  timestamp?: string; // 原网站使用 timestamp
  accountName?: string; // 原网站使用 accountName
  character?: { id?: string; name?: string };
  characters?: { id?: string; name?: string }[];
  equipments?: LegacyEquipment[] | Record<string, LegacyEquipment[]>;
  equipData?: LegacyEquipment[]; // 原网站使用 equipData
  simulationConfig?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

// 原网站的 XOR 解密函数
function decryptLegacyData(encryptedStr: string): LegacyExportData | null {
  try {
    // Base64 解码
    const decoded = atob(encryptedStr);
    // 解码 URI 组件
    const decodedStr = decodeURIComponent(decoded);
    // XOR 解密（密钥是 'YYSS2024'）
    const key = 'YYSS2024';
    let decrypted = '';
    for (let i = 0; i < decodedStr.length; i++) {
      decrypted += String.fromCharCode(decodedStr.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('解密数据失败:', error);
    return null;
  }
}

// 槽位ID到名称的映射
const SLOT_ID_MAP: Record<string, EquipmentSlot> = {
  '1': '武器',
  '3': '环',
  '4': '佩',
  '5': '冠胄',
  '6': '胸甲',
  '7': '胫甲',
  '8': '腕甲',
};

// 武器类型ID到名称的映射
const WEAPON_TYPE_ID_MAP: Record<string, WeaponType> = {
  '1': '剑',
  '2': '枪',
  '3': '伞',
  '4': '扇',
  '5': '绳标',
  '6': '双刀',
  '7': '陌刀',
  '8': '横刀',
  '9': '拳甲',
};

// 转换槽位（支持ID和名称）
function convertSlot(slot: string | undefined): EquipmentSlot {
  if (!slot) return '武器';
  // 如果是ID格式
  if (SLOT_ID_MAP[slot]) {
    return SLOT_ID_MAP[slot];
  }
  // 如果已经是名称格式
  const validSlots: EquipmentSlot[] = ['武器', '环', '佩', '冠胄', '胸甲', '胫甲', '腕甲'];
  if (validSlots.includes(slot as EquipmentSlot)) {
    return slot as EquipmentSlot;
  }
  return '武器';
}

// 转换武器类型（支持ID和名称）
function convertWeaponType(weaponType: string | undefined): WeaponType | undefined {
  if (!weaponType) return undefined;
  // 如果是ID格式
  if (WEAPON_TYPE_ID_MAP[weaponType]) {
    return WEAPON_TYPE_ID_MAP[weaponType];
  }
  // 如果已经是名称格式
  const validTypes: WeaponType[] = ['剑', '枪', '伞', '扇', '绳标', '双刀', '陌刀', '横刀', '拳甲'];
  if (validTypes.includes(weaponType as WeaponType)) {
    return weaponType as WeaponType;
  }
  return undefined;
}

// 转换词条
function convertAffix(affix: LegacyAffix | undefined): Affix {
  if (!affix) {
    return { type: '', value: 0, isPercent: false };
  }
  const type = (affix.type || affix.name || '') as Affix['type'];
  const value = typeof affix.value === 'string' ? parseFloat(affix.value) || 0 : (affix.value || 0);
  const isPercent = affix.isPercent ?? (type.includes('率') || type.includes('加成') || type.includes('增效') || type.includes('增伤'));
  return { type, value, isPercent };
}

// 转换单个装备
function convertEquipment(legacy: LegacyEquipment, characterId: string): Omit<Equipment, 'id' | 'createdAt'> {
  const slot = convertSlot(legacy.slot || legacy.slotId);
  const weaponType = convertWeaponType(legacy.weaponType || legacy.weaponTypeId);
  
  // 处理副词条 - 支持多种命名（包括原网站的 subStats）
  const subAffixesRaw = legacy.subAffixes || legacy.subs || legacy.sub || legacy.subStats || [];
  const subAffixes: Affix[] = [];
  for (let i = 0; i < 4; i++) {
    subAffixes.push(convertAffix(subAffixesRaw[i]));
  }

  // 处理主词条 - 支持多种命名（包括原网站的 mainStat）
  const mainAffixRaw = legacy.mainAffix || legacy.main || legacy.mainStat;
  
  // 处理定音词条 - 支持多种命名（包括原网站的 dingyinStat）
  const dingyinRaw = legacy.dingyin || legacy.dingyinAffix || legacy.dingyinStat;

  return {
    characterId,
    slot,
    weaponType: slot === '武器' ? weaponType : undefined,
    name: legacy.name || slot,
    isChengyin: legacy.isChengyin ?? legacy.chengyin ?? false,
    isPurple: legacy.isPurple ?? legacy.purple ?? false,
    canTransfer: legacy.canTransfer ?? legacy.transfer ?? legacy.isConvertible ?? false,
    mainAffix: convertAffix(mainAffixRaw),
    subAffixes,
    dingyin: convertAffix(dingyinRaw),
  };
}

// 检测并转换导入数据
function parseImportData(rawData: unknown, characterId: string): { equipments: Equipment[]; config?: Record<string, unknown> } | null {
  if (!rawData || typeof rawData !== 'object') {
    return null;
  }

  const data = rawData as LegacyExportData;
  let equipments: Equipment[] = [];

  // 情况0: 原网站格式 - 使用 equipData 字段
  if (Array.isArray(data.equipData)) {
    console.log('检测到原网站格式 (equipData)');
    equipments = (data.equipData as LegacyEquipment[]).map((eq, index) => ({
      ...convertEquipment(eq, characterId),
      id: String(eq.id || `imported-${index}`),
      createdAt: Date.now(),
    }));
  }
  // 情况1: 我们自己的导出格式 - 直接有 equipments 数组
  else if (Array.isArray(data.equipments)) {
    equipments = (data.equipments as LegacyEquipment[]).map((eq, index) => ({
      ...convertEquipment(eq, characterId),
      id: String(eq.id || `imported-${index}`),
      createdAt: Date.now(),
    }));
  }
  // 情况2: 原网站格式 - equipments 是 Record<characterId, Equipment[]>
  else if (data.equipments && typeof data.equipments === 'object') {
    const equipmentRecord = data.equipments as Record<string, LegacyEquipment[]>;
    // 获取第一个角色的装备，或者所有装备
    const allEquipments: LegacyEquipment[] = [];
    for (const charEquipments of Object.values(equipmentRecord)) {
      if (Array.isArray(charEquipments)) {
        allEquipments.push(...charEquipments);
      }
    }
    equipments = allEquipments.map((eq, index) => ({
      ...convertEquipment(eq, characterId),
      id: String(eq.id || `imported-${index}`),
      createdAt: Date.now(),
    }));
  }
  // 情况3: 直接是装备数组
  else if (Array.isArray(rawData)) {
    equipments = (rawData as LegacyEquipment[]).map((eq, index) => ({
      ...convertEquipment(eq, characterId),
      id: String(eq.id || `imported-${index}`),
      createdAt: Date.now(),
    }));
  }

  if (equipments.length === 0) {
    return null;
  }

  return {
    equipments,
    config: data.simulationConfig || data.config,
  };
}

interface ImportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportExportModal({ open, onOpenChange }: ImportExportModalProps) {
  const [dataContent, setDataContent] = useState('');
  const [showImportWarning, setShowImportWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getCurrentCharacter, currentCharacterId } = useCharacterStore();
  const { getEquipmentsByCharacter, importEquipments } = useEquipmentStore();
  const { getConfig, importConfig } = useSimulationStore();

  const currentCharacter = getCurrentCharacter();

  const handleExport = () => {
    if (!currentCharacter || !currentCharacterId) return;

    const exportData: ExportData = {
      version: APP_VERSION,
      exportTime: Date.now(),
      character: currentCharacter,
      equipments: getEquipmentsByCharacter(currentCharacterId),
      simulationConfig: getConfig(currentCharacterId),
    };

    setDataContent(JSON.stringify(exportData, null, 2));
  };

  const handleDownload = () => {
    if (!dataContent || !currentCharacter) return;

    const blob = new Blob([dataContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCharacter.name}_装备数据_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDataContent(content);
      setShowImportWarning(true);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDataContent(text);
      setShowImportWarning(true);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleConfirmImport = () => {
    console.log('handleConfirmImport', currentCharacterId, dataContent);
    if (!currentCharacterId || !dataContent) return;

    try {
      // 尝试解析数据，支持多种编码格式
      const trimmedData = dataContent.trim();
      let rawData: unknown = null;
      
      // 首先尝试原网站的 XOR + Base64 解密格式
      if (!trimmedData.startsWith('{') && !trimmedData.startsWith('[')) {
        const decrypted = decryptLegacyData(trimmedData);
        if (decrypted) {
          console.log('成功使用原网站格式解密数据');
          rawData = decrypted;
        }
      }
      
      // 如果原网站格式解密失败，尝试其他格式
      if (!rawData) {
        let jsonString = trimmedData;
        
        // 检测是否是 URL 编码的数据
        if (jsonString.includes('%7B') || jsonString.includes('%22')) {
          try {
            jsonString = decodeURIComponent(jsonString);
            console.log('检测到 URL 编码数据，已解码');
          } catch (decodeErr) {
            console.log('URL 解码失败，尝试其他方式');
          }
        }
        
        // 检测是否是普通 Base64 编码（不是 XOR 加密的）
        if (!jsonString.startsWith('{') && !jsonString.startsWith('[')) {
          try {
            const decoded = atob(jsonString);
            if (decoded.startsWith('{') || decoded.startsWith('[')) {
              jsonString = decoded;
              console.log('检测到 Base64 编码数据，已解码');
            }
          } catch (base64Err) {
            console.log('Base64 解码失败，使用原始数据');
          }
        }
        
        rawData = JSON.parse(jsonString);
      }
      
      // 使用智能解析函数处理各种格式
      const parsed = parseImportData(rawData, currentCharacterId);
      
      if (!parsed) {
        alert('未能识别数据格式，请检查导入的数据是否正确');
        return;
      }

      // 导入装备
      if (parsed.equipments && parsed.equipments.length > 0) {
        importEquipments(currentCharacterId, parsed.equipments);
        console.log(`成功导入 ${parsed.equipments.length} 件装备`);
      }

      // 导入配置（如果有）
      if (parsed.config) {
        try {
          // 尝试转换旧格式的配置
          const config = parsed.config as Record<string, unknown>;
          const xinfaLoadout = (config.xinfaLoadout as { slot1?: string; slot2?: string; slot3?: string; slot4?: string } | undefined) || {};
          const newConfig = {
            className: (config.className || config.xinfa || '破竹尘') as string,
            setName: (config.setName || config.neiGong || '连星') as string,
            xinfaLoadout: {
              slot1: xinfaLoadout.slot1 || '',
              slot2: xinfaLoadout.slot2 || '',
              slot3: xinfaLoadout.slot3 || '',
              slot4: xinfaLoadout.slot4 || '',
            },
            equippedIds: (config.equippedIds || {}) as Record<string, string | undefined>,
            useEarlySeason: ((config.useEarlySeason ?? config.useNextSeason) ?? false) as boolean,
            freezeDingyin: ((config.freezeDingyin) ?? false) as boolean,
            assumeFullChengyin: ((config.assumeFullChengyin) ?? false) as boolean,
          };
          importConfig(currentCharacterId, newConfig);
        } catch (configErr) {
          console.warn('配置导入失败，使用默认配置:', configErr);
        }
      }

      setShowImportWarning(false);
      setDataContent('');
      onOpenChange(false);
      
      alert(`成功导入 ${parsed.equipments.length} 件装备！`);
    } catch (err) {
      console.error('Failed to parse import data:', err);
      alert('数据格式错误，请检查导入的数据是否正确。\n\n支持的格式：\n1. 本应用导出的数据\n2. 原网站(spongem.com)导出的数据');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>导出/导入数据</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!currentCharacterId}
            >
              导出数据
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!dataContent}
            >
              下载为文件
            </Button>
            <Label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" asChild>
                <span>上传文件导入</span>
              </Button>
            </Label>
            <Button variant="outline" onClick={handlePasteImport}>
              粘贴导入
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>数据内容：</Label>
            <textarea
              className="w-full h-48 p-3 text-sm bg-muted rounded-md border border-border resize-none font-mono"
              placeholder="点击导出数据按钮生成数据，或粘贴/上传数据文件进行导入"
              value={dataContent}
              onChange={(e) => setDataContent(e.target.value)}
            />
          </div>

          {showImportWarning && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md space-y-3">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <span>⚠️ 警告</span>
              </div>
              <p className="text-sm text-muted-foreground">
                导入数据将完全覆盖当前角色（{currentCharacter?.name}）的所有装备数据！
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleConfirmImport}>
                  确认导入
                </Button>
                <Button variant="outline" onClick={() => setShowImportWarning(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
