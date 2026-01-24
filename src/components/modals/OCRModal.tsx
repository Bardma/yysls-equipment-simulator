'use client';

import { useState, useRef, useCallback } from 'react';
import { Equipment, Affix, EquipmentSlot, AffixType } from '@/types';
import { AFFIX_TYPES, EQUIPMENT_SLOTS } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface OCRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (data: Partial<Equipment>) => void;
}

export function OCRModal({ open, onOpenChange, onResult }: OCRModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('准备识别...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImage(event.target?.result as string);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  }, []);

  // 添加粘贴监听
  useState(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
    }
  });

  const processImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setStatus('正在加载OCR引擎...');

    try {
      // 动态导入 Tesseract.js
      const Tesseract = await import('tesseract.js');

      setStatus('正在识别文字...');

      const result = await Tesseract.recognize(image, 'chi_sim', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setStatus(`识别中... ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text;
      console.log('OCR Result:', text);

      // 解析识别结果
      const parsedData = parseOCRText(text);

      if (parsedData) {
        onResult(parsedData);
        setImage(null);
        onOpenChange(false);
      } else {
        setStatus('识别完成，但未能解析出装备信息。请手动输入。');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setStatus('识别失败，请重试或手动输入');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseOCRText = (text: string): Partial<Equipment> | null => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const result: Partial<Equipment> = {
      subAffixes: [
        { type: '', value: 0, isPercent: false },
        { type: '', value: 0, isPercent: false },
        { type: '', value: 0, isPercent: false },
        { type: '', value: 0, isPercent: false },
      ],
    };

    // 尝试识别装备位置
    for (const slot of EQUIPMENT_SLOTS) {
      if (text.includes(slot)) {
        result.slot = slot;
        break;
      }
    }

    // 尝试识别词条
    const affixPatterns: { type: AffixType; patterns: RegExp[] }[] = AFFIX_TYPES.map(type => ({
      type,
      patterns: [
        new RegExp(`${type}[:\\s]*[+]?([\\d.]+)%?`, 'i'),
        new RegExp(`([\\d.]+)%?[\\s]*${type}`, 'i'),
      ],
    }));

    let subAffixIndex = 0;

    for (const line of lines) {
      for (const { type, patterns } of affixPatterns) {
        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match) {
            const value = parseFloat(match[1]);
            if (!isNaN(value)) {
              const affix: Affix = {
                type,
                value,
                isPercent: type.includes('百分比') || line.includes('%'),
              };

              // 判断是主词条还是副词条
              if (line.includes('主') || (!result.mainAffix?.type && subAffixIndex === 0)) {
                result.mainAffix = affix;
              } else if (line.includes('定音')) {
                result.dingyin = affix;
              } else if (subAffixIndex < 4) {
                result.subAffixes![subAffixIndex] = affix;
                subAffixIndex++;
              }
              break;
            }
          }
        }
      }
    }

    // 如果没有识别到任何词条，返回 null
    if (!result.mainAffix?.type && !result.subAffixes?.some(a => a.type)) {
      return null;
    }

    return result;
  };

  const handleClose = () => {
    setImage(null);
    setStatus('准备识别...');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>文字识别 (OCR)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">示例</p>
            <p>
              参考示例图进行截图，注意背景干净，文字清晰，尽量不要截图到别的元素（如词条左边那条竖线）。
              注意：OCR文字识别结果有可能不准确，需手动调整。
            </p>
          </div>

          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Preview" className="max-h-48 mx-auto object-contain" />
            ) : (
              <div className="text-muted-foreground">
                <p>点击上传文件或按 Ctrl+V 粘贴图片</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            选择文件上传
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {status}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={processImage}
            disabled={!image || isProcessing}
          >
            {isProcessing ? '识别中...' : '开始识别'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
