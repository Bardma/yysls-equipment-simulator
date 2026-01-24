'use client';

import { useCallback, useRef, useState } from 'react';

import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Crop as CropIcon, RotateCcw } from 'lucide-react';

import { Button } from '../ui/button';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

/**
 * 计算图片的中心裁剪区域
 */
function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  // 默认使用自由裁剪，不限制比例
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      undefined, // 无固定比例
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const ImageCropper = ({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  // 图片加载完成后设置初始裁剪区域
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  // 重置裁剪区域
  const handleReset = useCallback(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height));
    }
  }, []);

  // 确认裁剪
  const handleConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      // 如果没有裁剪区域，使用原图
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      onCropComplete(blob);
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    // 计算实际裁剪尺寸
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // 绘制裁剪区域到 canvas
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    // 转换为 Blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/png',
      1
    );
  }, [completedCrop, imageSrc, onCropComplete]);

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs"
            title="重置裁剪区域"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            重置
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          拖动四角调整裁剪区域
        </p>
      </div>

      {/* 裁剪区域 */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 flex items-center justify-center bg-black/30">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          className="max-h-full max-w-full"
          keepSelection
          minWidth={50}
          minHeight={50}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            alt="待裁剪图片"
            src={imageSrc}
            onLoad={onImageLoad}
            style={{
              maxHeight: '55vh',
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </ReactCrop>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-2 px-3 py-3 border-t border-border/40">
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="text-xs sm:text-sm"
        >
          返回
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          className="text-xs sm:text-sm"
        >
          <CropIcon className="mr-1.5 h-4 w-4" />
          确认裁剪
        </Button>
      </div>
    </div>
  );
};
