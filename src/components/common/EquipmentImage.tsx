'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

const SIZE_MAP = {
  sm: { width: 40, height: 40 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 120, height: 120 },
} as const;

interface EquipmentImageProps {
  src: string;
  name: string;
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export const EquipmentImage = ({
  src,
  name,
  size = 'md',
  className,
}: EquipmentImageProps) => {
  const dimensions = SIZE_MAP[size];
  const imageSrc = src.startsWith('/') ? src : `/${src}`;

  return (
    <Image
      src={imageSrc}
      alt={name}
      width={dimensions.width}
      height={dimensions.height}
      className={cn('rounded-md border border-slate-500/30 shadow-sm', className)}
    />
  );
};
