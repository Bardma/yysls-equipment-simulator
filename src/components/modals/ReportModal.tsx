'use client';

import html2canvas from 'html2canvas-pro';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { xinfaLabel } from '@/lib/statName';

type DengLevelKey = NonNullable<
  Parameters<typeof import('@/lib/calculator').Calculator.calculateTotal>[8]
>;

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string | null;
  currentClass: string;
  setType: string;
  level: DengLevelKey;
  xinfaLoadout: string[];
  graduationInfo: {
    accurate: string;
    excel: string;
    dps: number;
  } | null;
  statDisplay: Array<{
    label: string;
    value: string;
    highlight?: string;
    suffix?: string;
    isLoaned?: boolean;
    isEarlySeason?: boolean;
  }>;
  earlySeasonBonus: boolean;
  loanDingyin: boolean;
}

const colors = {
  bg: { primary: '#0f172a', secondary: '#1e293b', tertiary: '#334155' },
  text: { primary: '#f1f5f9', secondary: '#94a3b8', muted: '#64748b' },
  accent: {
    amber: '#fbbf24',
    yellow: '#fde047',
    sky: '#38bdf8',
    purple: '#a78bfa',
    emerald: '#34d399',
    cyan: '#22d3ee',
    orange: '#fb923c',
  },
};

export const ReportModal = ({
  open,
  onOpenChange,
  accountName,
  currentClass,
  setType,
  level,
  xinfaLoadout,
  graduationInfo,
  statDisplay,
  earlySeasonBonus,
  loanDingyin,
}: ReportModalProps) => {
  const t = useTranslations('report');
  const tHeader = useTranslations('header');
  const tGraduation = useTranslations('graduation');
  const tSimulation = useTranslations('simulation');
  const tStats = useTranslations('stats');

  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: colors.bg.primary,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${accountName || t('character')}_${currentClass}_${t('reportFile')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Generate report failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-[800px] max-w-[95vw] max-h-[90vh] p-0 bg-slate-900 border-slate-700 overflow-hidden">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-700/50">
          <DialogTitle className="text-xl font-bold text-slate-100">{t('preview')}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          <div
            ref={reportRef}
            style={{
              padding: '24px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.bg.primary} 0%, ${colors.bg.secondary} 50%, ${colors.bg.primary} 100%)`,
              width: '100%',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: '28px' }}>⚔</span>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.accent.amber, margin: 0 }}>
                  {tHeader('title')}
                </h1>
              </div>
              <div style={{ color: colors.text.muted, fontSize: '14px' }}>
                {tHeader('subtitle')} · {t('characterReport')}
              </div>
            </div>

            <div
              style={{
                marginBottom: '12px',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.35)',
                textAlign: 'center',
                color: colors.text.secondary,
                fontSize: '13px',
              }}
            >
              Level: <span style={{ color: colors.accent.yellow, fontWeight: 700 }}>{String(level)}</span>
            </div>

            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(253, 224, 71, 0.05) 50%, rgba(251, 191, 36, 0.1) 100%)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fcd34d' }}>
                {accountName || t('unnamedCharacter')}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background:
                    'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 165, 233, 0.05) 50%, rgba(56, 189, 248, 0.1) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <div style={{ color: 'rgba(56, 189, 248, 0.85)', fontSize: '12px', marginBottom: '6px' }}>
                  {t('currentClass')}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7dd3fc' }}>{currentClass}</div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background:
                    'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(167, 139, 250, 0.1) 100%)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                }}
              >
                <div style={{ color: 'rgba(167, 139, 250, 0.85)', fontSize: '12px', marginBottom: '6px' }}>
                  {t('setSelection')}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c4b5fd' }}>{setType || t('none')}</div>
              </div>
            </div>

            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(52, 211, 153, 0.1) 100%)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
              }}
            >
              <div style={{ color: 'rgba(52, 211, 153, 0.85)', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
                {tSimulation('xinfaConfig')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                {xinfaLoadout.map((xinfa, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(52, 211, 153, 0.15)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: colors.text.muted, marginBottom: '4px' }}>
                      {t('slot')} {idx + 1}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#6ee7b7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {xinfa ? xinfaLabel(xinfa) : t('empty')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(30, 41, 59, 0.45)',
                border: '1px solid rgba(71, 85, 105, 0.35)',
              }}
            >
              {graduationInfo ? (
                <>
                  <div style={{ fontSize: '14px', color: colors.text.muted, marginBottom: '6px' }}>
                    {tGraduation('title')}
                    {loanDingyin ? ' · 💰' : ''}
                    {earlySeasonBonus ? ' · ⏩' : ''}
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: 800, color: colors.accent.amber, marginBottom: '10px' }}>
                    {graduationInfo.accurate}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', color: colors.text.secondary, fontSize: '13px' }}>
                    <div>Excel: <b style={{ color: colors.accent.yellow }}>{graduationInfo.excel}</b></div>
                    <div>DPS: <b style={{ color: colors.accent.orange }}>{graduationInfo.dps.toLocaleString()}</b></div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: colors.text.muted, padding: '12px' }}>
                  {tGraduation('noRotation')}
                </div>
              )}
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.35)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}
            >
              <div style={{ color: 'rgba(34, 197, 94, 0.85)', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                {tStats('title')}
              </div>

              {statDisplay.length === 0 ? (
                <div style={{ textAlign: 'center', color: colors.text.muted, padding: '10px' }}>{tStats('noStats')}</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px 18px' }}>
                  {statDisplay.map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(30, 41, 59, 0.45)',
                        border: '1px solid rgba(71, 85, 105, 0.25)',
                        fontSize: '12px',
                        color: colors.text.secondary,
                      }}
                    >
                      <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                      <span style={{ whiteSpace: 'nowrap', fontWeight: 800, color: colors.text.primary }}>
                        {item.value}
                        {item.highlight ? <span style={{ marginLeft: 4, color: colors.accent.amber }}>{item.highlight}</span> : null}
                        {item.suffix ? <span style={{ marginLeft: 2, color: colors.text.muted, fontSize: 10 }}>{item.suffix}</span> : null}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(71, 85, 105, 0.5)', textAlign: 'center' }}>
              <div style={{ color: colors.text.muted, fontSize: '12px' }}>
                {t('generatedAt')}: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 px-6 py-4 border-t border-slate-700/50 bg-slate-900">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? t('generating') : t('download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};