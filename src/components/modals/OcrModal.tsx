'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ImagePlus, Upload } from 'lucide-react';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

interface OcrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (imageFile: File) => void;
  isLoading?: boolean;
}

export const OcrModal = ({ open, onOpenChange, onConfirm, isLoading = false }: OcrModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 清理预览URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 模态框关闭时重置状态
  useEffect(() => {
    if (!open) {
      setSelectedImage(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [open, previewUrl]);

  // 处理图片选择
  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  // 文件选择处理
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // 粘贴事件处理
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!open) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImageSelect(file);
            event.preventDefault();
            break;
          }
        }
      }
    },
    [open, handleImageSelect]
  );

  // 监听粘贴事件
  useEffect(() => {
    if (open) {
      document.addEventListener('paste', handlePaste);
      return () => {
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [open, handlePaste]);

  // 拖放处理
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // 确认识别
  const handleConfirm = () => {
    if (selectedImage) {
      onConfirm(selectedImage);
    }
  };

  // 点击选择区域
  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OCR识别装备词条</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 示例图区域 */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">请上传类似下方格式的装备词条截图：</p>
            <div className="flex justify-center rounded-md border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ocr-example.png"
                alt="示例截图"
                className="max-h-[160px] rounded object-contain"
              />
            </div>
          </div>

          {/* 图片选择/预览区域 */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              点击下方区域选择图片，或使用 <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">Ctrl+V</kbd>{' '}
              粘贴截图：
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              ref={dropZoneRef}
              onClick={handleDropZoneClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`flex min-h-[160px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                previewUrl
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              {previewUrl ? (
                <div className="flex items-center justify-center p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="max-h-[240px] max-w-full rounded object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="bg-muted rounded-full p-3">
                    <ImagePlus className="text-muted-foreground h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">点击选择或拖放图片</p>
                    <p className="text-muted-foreground text-xs">支持 JPG、PNG、WebP 等格式</p>
                  </div>
                </div>
              )}
            </div>
            {previewUrl && (
              <p className="text-muted-foreground text-center text-xs">点击可重新选择图片</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedImage || isLoading}>
            {isLoading ? (
              <>
                <Upload className="mr-1.5 h-4 w-4 animate-pulse" />
                识别中...
              </>
            ) : (
              '开始识别'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
