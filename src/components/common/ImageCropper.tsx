'use client';

import { useCallback, useRef, useState } from 'react';

import ReactCrop, { Crop, PixelCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Crop as CropIcon, RotateCcw } from 'lucide-react';

import { Button } from '../ui/button';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

/**
 * JiSuanTuPianDeZhongXinCaiJianQuYu
 */
function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  // MoRenShiYongZiYouCaiJian，BuXianZhiBiLi
  // ZhiJieChuangJianYiGeJuZhongDeCaiJianQuYu，BuShiYong makeAspectCrop（TaXuYaoGuDingBiLi）
  return centerCrop(
    {
      unit: '%',
      width: 90,
      height: 90,
      x: 0,
      y: 0,
    },
    mediaWidth,
    mediaHeight
  );
}

export const ImageCropper = ({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  // TuPianJiaZaiWanChengHouSheZhiChuShiCaiJianQuYu
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  // ZhongZhiCaiJianQuYu
  const handleReset = useCallback(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height));
    }
  }, []);

  // ConfirmCaiJian
  const handleConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      // RuGuoMeiYouCaiJianQuYu，ShiYongYuanTu
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

    // JiSuanShiJiCaiJianChiCun
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

    // HuiZhiCaiJianQuYuDao canvas
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

    // ZhuanHuanWei Blob
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
      {/* GongJuLan */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs"
            title="ZhongZhiCaiJianQuYu"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            ZhongZhi
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          TuoDongSiJiaoTiaoZhengCaiJianQuYu
        </p>
      </div>

      {/* CaiJianQuYu */}
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
            alt="DaiCaiJianTuPian"
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

      {/* CaoZuoAnNiu */}
      <div className="flex items-center justify-end gap-2 px-3 py-3 border-t border-border/40">
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="text-xs sm:text-sm"
        >
          FanHui
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          className="text-xs sm:text-sm"
        >
          <CropIcon className="mr-1.5 h-4 w-4" />
          ConfirmCaiJian
        </Button>
      </div>
    </div>
  );
};
