'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Crop, ImagePlus, Upload } from 'lucide-react';

import { ImageCropper } from '../common/ImageCropper';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

type ModalStep = 'upload' | 'crop';

interface OcrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (imageFile: File) => void;
  isLoading?: boolean;
}

export const OcrModal = ({ open, onOpenChange, onConfirm, isLoading = false }: OcrModalProps) => {
  const [step, setStep] = useState<ModalStep>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
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

  // 清理裁剪预览URL
  useEffect(() => {
    return () => {
      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }
    };
  }, [croppedPreviewUrl]);

  // 模态框关闭时重置状态
  useEffect(() => {
    if (!open) {
      setStep('upload');
      setSelectedImage(null);
      setCroppedImage(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
        setCroppedPreviewUrl(null);
      }
    }
  }, [open, previewUrl, croppedPreviewUrl]);

  // 处理图片选择
  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setSelectedImage(file);
    setCroppedImage(null);
    setCroppedPreviewUrl(null);
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
      if (!open || step !== 'upload') return;

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
    [open, step, handleImageSelect]
  );

  // 监听粘贴事件
  useEffect(() => {
    if (open && step === 'upload') {
      document.addEventListener('paste', handlePaste);
      return () => {
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [open, step, handlePaste]);

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

  // 进入裁剪模式
  const handleStartCrop = useCallback(() => {
    if (selectedImage && previewUrl) {
      setStep('crop');
    }
  }, [selectedImage, previewUrl]);

  // 裁剪完成
  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    // 将 Blob 转换为 File
    const croppedFile = new File([croppedBlob], 'cropped-image.png', {
      type: 'image/png',
    });
    setCroppedImage(croppedFile);
    // 创建裁剪后图片的预览 URL
    const url = URL.createObjectURL(croppedBlob);
    setCroppedPreviewUrl(url);
    setStep('upload');
  }, []);

  // 取消裁剪
  const handleCropCancel = useCallback(() => {
    setStep('upload');
  }, []);

  // 确认识别
  const handleConfirm = () => {
    // 优先使用裁剪后的图片，否则使用原图
    const imageToUse = croppedImage || selectedImage;
    if (imageToUse) {
      onConfirm(imageToUse);
    }
  };

  // 点击选择区域
  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  // 获取当前预览的图片URL（优先显示裁剪后的图片）
  const displayPreviewUrl = croppedPreviewUrl || previewUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex! flex-col! gap-0 p-0 sm:max-w-md max-h-[90vh]">
        {step === 'upload' ? (
          <>
            <DialogHeader className="shrink-0 border-b border-border/40 px-4 sm:px-6 py-4">
              <DialogTitle className="text-base sm:text-lg">OCR识别装备词条</DialogTitle>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
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
                    displayPreviewUrl
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  {displayPreviewUrl ? (
                    <div className="flex items-center justify-center p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayPreviewUrl}
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
                {displayPreviewUrl && (
                  <div className="flex flex-col items-center gap-1.5">
                    <p className="text-muted-foreground text-center text-xs">点击可重新选择图片</p>
                    {croppedImage && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <Crop className="h-3 w-3" />
                        已裁剪
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-border/40 px-4 sm:px-6 py-4">
              <div className="flex w-full items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartCrop}
                  disabled={!selectedImage || isLoading}
                  className="text-xs sm:text-sm"
                >
                  <Crop className="mr-1.5 h-4 w-4" />
                  裁剪图片
                </Button>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading} className="text-xs sm:text-sm">
                    取消
                  </Button>
                  <Button size="sm" onClick={handleConfirm} disabled={!selectedImage || isLoading} className="text-xs sm:text-sm">
                    {isLoading ? (
                      <>
                        <Upload className="mr-1.5 h-4 w-4 animate-pulse" />
                        识别中...
                      </>
                    ) : (
                      '开始识别'
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="shrink-0 border-b border-border/40 px-4 sm:px-6 py-4">
              <DialogTitle className="text-base sm:text-lg">裁剪图片</DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0">
              {previewUrl && (
                <ImageCropper
                  imageSrc={previewUrl}
                  onCropComplete={handleCropComplete}
                  onCancel={handleCropCancel}
                />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
