'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ThemeColor = 'sky' | 'amber' | 'emerald' | 'slate';

const THEME_STYLES: Record<ThemeColor, { border: string; bg: string; iconBg: string; iconText: string }> = {
  sky: {
    border: 'border-sky-500/20',
    bg: 'bg-linear-to-br from-sky-500/5 via-transparent to-cyan-500/5',
    iconBg: 'bg-sky-500/20',
    iconText: 'text-sky-400',
  },
  amber: {
    border: 'border-amber-500/20',
    bg: 'bg-linear-to-br from-amber-500/5 via-transparent to-orange-500/5',
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
  },
  emerald: {
    border: 'border-emerald-500/20',
    bg: 'bg-linear-to-br from-emerald-500/5 via-transparent to-teal-500/5',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
  },
  slate: {
    border: 'border-slate-500/20',
    bg: 'bg-linear-to-br from-slate-500/5 via-transparent to-slate-600/5',
    iconBg: 'bg-slate-500/20',
    iconText: 'text-slate-300',
  },
};

interface CollapsibleCardProps {
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  themeColor: ThemeColor;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleCard = ({
  title,
  icon,
  expanded,
  onToggle,
  themeColor,
  children,
  className,
}: CollapsibleCardProps) => {
  const theme = THEME_STYLES[themeColor];

  return (
    <Card
      className={cn(
        'p-3 sm:p-4 gap-2',
        theme.border,
        theme.bg,
        expanded ? 'flex-1 overflow-y-auto' : 'overflow-hidden',
        className
      )}
    >
      <div
        role="button"
        tabIndex={0}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 sm:px-2 py-1 text-left"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
      >
        <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
          <span
            className={cn(
              'inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md text-xs',
              theme.iconBg,
              theme.iconText
            )}
          >
            {icon}
          </span>
          {title}
        </h3>
        {expanded ? (
          <ChevronUp className="text-muted-foreground h-4 w-4" />
        ) : (
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        )}
      </div>
      {expanded ? <div className="mt-2 sm:mt-3">{children}</div> : null}
    </Card>
  );
};
