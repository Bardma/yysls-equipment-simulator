'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface XinfaSlotProps {
  index: number;
  name: string;
  isLocked: boolean;
  onClick: () => void;
}

export const XinfaSlot = ({ index, name, isLocked, onClick }: XinfaSlotProps) => {
  return (
    <button
      key={`xinfa-${index}`}
      className={cn(
        'rounded-lg border p-0 text-xs overflow-hidden w-full sm:w-fit',
        isLocked
          ? 'border-muted-foreground/60 text-muted-foreground bg-muted/10 cursor-not-allowed border-dashed'
          : 'border-sky-500/20 hover:border-sky-500/30 cursor-pointer'
      )}
      onClick={() => {
        if (!isLocked) onClick();
      }}
    >
      <div className="bg-sky-950/20 relative flex h-16 w-full sm:h-20 sm:w-20 items-center justify-center overflow-hidden aspect-square">
        {name ? (
          <>
            <Image
              src={`/icon/${name}.jpg`}
              alt={name}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center bg-black/70 py-0.5 sm:py-1">
              <span className="text-[10px] sm:text-xs font-medium text-white px-0.5 sm:px-1 text-center leading-tight truncate w-full">
                {name}
              </span>
              {isLocked && <span className="text-[8px] sm:text-[10px] text-white/70">Locked</span>}
            </div>
          </>
        ) : (
          <span className="text-muted-foreground text-[9px] sm:text-[10px]">点击选择</span>
        )}
      </div>
    </button>
  );
};
