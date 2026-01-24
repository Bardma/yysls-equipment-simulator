'use client';

import html2canvas from 'html2canvas-pro';
import { Download } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string | null;
  currentClass: string;
  setType: string;
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

// 颜色定义 - 使用标准 hex/rgb 格式以兼容 html2canvas
const colors = {
  bg: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
  },
  accent: {
    amber: '#fbbf24',
    yellow: '#fde047',
    sky: '#38bdf8',
    purple: '#a78bfa',
    emerald: '#34d399',
    cyan: '#22d3ee',
    orange: '#fb923c',
  },
  border: {
    default: 'rgba(71, 85, 105, 0.3)',
    sky: 'rgba(56, 189, 248, 0.2)',
    purple: 'rgba(167, 139, 250, 0.2)',
    emerald: 'rgba(52, 211, 153, 0.2)',
    amber: 'rgba(251, 191, 36, 0.2)',
  },
};

export const ReportModal = ({
  open,
  onOpenChange,
  accountName,
  currentClass,
  setType,
  xinfaLoadout,
  graduationInfo,
  statDisplay,
  earlySeasonBonus,
  loanDingyin,
}: ReportModalProps) => {
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
      link.download = `${accountName || '角色'}_${currentClass}_报告.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('生成报告失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 根据状态获取毕业率显示颜色
  const getGradRateColor = () => {
    if (loanDingyin && earlySeasonBonus) return colors.accent.purple;
    if (loanDingyin) return colors.accent.purple;
    if (earlySeasonBonus) return colors.accent.cyan;
    return colors.accent.amber;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-[800px] max-w-[95vw] max-h-[90vh] p-0 bg-slate-900 border-slate-700 overflow-hidden">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-700/50">
          <DialogTitle className="text-xl font-bold text-slate-100">角色报告预览</DialogTitle>
        </DialogHeader>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          {/* Report Content - 使用内联样式以兼容 html2canvas */}
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
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>⚔</span>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: colors.accent.amber,
                margin: 0,
              }}>
                燕云十六声
              </h1>
            </div>
            <div style={{ color: colors.text.muted, fontSize: '14px' }}>
              装备毕业率管理器 · 角色报告
            </div>
          </div>

          {/* Character Name */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(253, 224, 71, 0.05) 50%, rgba(251, 191, 36, 0.1) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 装饰性角落 */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              borderBottomLeftRadius: '100%',
              background: 'linear-gradient(225deg, rgba(251, 191, 36, 0.2) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '22px' }}>👤</span>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#fcd34d', letterSpacing: '-0.5px' }}>
                {accountName || '未命名角色'}
              </span>
            </div>
          </div>

          {/* Class & Set */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {/* 流派 */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 165, 233, 0.05) 50%, rgba(56, 189, 248, 0.1) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50px',
                height: '50px',
                borderBottomLeftRadius: '100%',
                background: 'linear-gradient(225deg, rgba(56, 189, 248, 0.2) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    fontSize: '10px',
                  }}>⚔</span>
                  <span style={{ color: 'rgba(56, 189, 248, 0.8)', fontSize: '11px' }}>当前流派</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7dd3fc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentClass}</div>
              </div>
            </div>
            {/* 套装 */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(167, 139, 250, 0.1) 100%)',
              border: '1px solid rgba(167, 139, 250, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50px',
                height: '50px',
                borderBottomLeftRadius: '100%',
                background: 'linear-gradient(225deg, rgba(167, 139, 250, 0.2) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    background: 'rgba(167, 139, 250, 0.2)',
                    color: '#a78bfa',
                    fontSize: '10px',
                  }}>🎽</span>
                  <span style={{ color: 'rgba(167, 139, 250, 0.8)', fontSize: '11px' }}>套装选择</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c4b5fd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{setType || '无'}</div>
              </div>
            </div>
          </div>

          {/* Xinfa Config */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(52, 211, 153, 0.1) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 装饰性角落 */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              borderBottomLeftRadius: '100%',
              background: 'linear-gradient(225deg, rgba(52, 211, 153, 0.2) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: 'rgba(52, 211, 153, 0.2)',
                  color: '#34d399',
                  fontSize: '11px',
                }}>📖</span>
                <span style={{ color: 'rgba(52, 211, 153, 0.8)', fontSize: '12px', fontWeight: '500' }}>心法配置</span>
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
                    <div style={{ fontSize: '10px', color: colors.text.muted, marginBottom: '4px' }}>槽位 {idx + 1}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#6ee7b7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {xinfa || '空'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Graduation Rate */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: loanDingyin && earlySeasonBonus
              ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(34, 211, 238, 0.05) 50%, rgba(34, 211, 238, 0.1) 100%)'
              : loanDingyin
                ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0.05) 50%, rgba(251, 191, 36, 0.1) 100%)'
                : earlySeasonBonus
                  ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.05) 50%, rgba(251, 191, 36, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(253, 224, 71, 0.05) 50%, rgba(249, 115, 22, 0.1) 100%)',
            border: `1px solid ${loanDingyin && earlySeasonBonus ? 'rgba(167, 139, 250, 0.3)' : loanDingyin ? 'rgba(167, 139, 250, 0.3)' : earlySeasonBonus ? 'rgba(34, 211, 238, 0.3)' : 'rgba(253, 224, 71, 0.2)'}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 装饰性角落 */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '80px',
              height: '80px',
              borderBottomLeftRadius: '100%',
              background: loanDingyin && earlySeasonBonus
                ? 'linear-gradient(225deg, rgba(167, 139, 250, 0.2) 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%)'
                : loanDingyin
                  ? 'linear-gradient(225deg, rgba(167, 139, 250, 0.2) 0%, transparent 100%)'
                  : earlySeasonBonus
                    ? 'linear-gradient(225deg, rgba(34, 211, 238, 0.2) 0%, transparent 100%)'
                    : 'linear-gradient(225deg, rgba(253, 224, 71, 0.2) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            
            <div style={{ position: 'relative' }}>
              {/* 状态标签 */}
              {(loanDingyin || earlySeasonBonus) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', marginBottom: '8px' }}>
                  {loanDingyin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d8b4fe' }}>
                      <span>💰</span>
                      <span>贷款满定音</span>
                    </div>
                  )}
                  {earlySeasonBonus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#67e8f9' }}>
                      <span>⏩</span>
                      <span>下赛季属性</span>
                    </div>
                  )}
                </div>
              )}
              
              {graduationInfo ? (
                <div>
                  {/* 大号毕业率 */}
                  <div style={{
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: loanDingyin && earlySeasonBonus
                      ? '#c4b5fd'
                      : loanDingyin
                        ? '#c4b5fd'
                        : earlySeasonBonus
                          ? '#67e8f9'
                          : '#fcd34d',
                    letterSpacing: '-1px',
                    marginBottom: '12px',
                  }}>
                    {graduationInfo.accurate}
                  </div>
                  
                  {/* 详情行 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: 'rgba(253, 224, 71, 0.2)',
                        color: '#fcd34d',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}>E</span>
                      <span style={{ color: colors.text.muted }}>表格显示</span>
                      <span style={{ marginLeft: 'auto', fontWeight: '500', color: '#fef08a' }}>{graduationInfo.excel}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: 'rgba(249, 115, 22, 0.2)',
                        color: '#fb923c',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}>D</span>
                      <span style={{ color: colors.text.muted }}>轴期望秒伤</span>
                      <span style={{ marginLeft: 'auto', fontWeight: '500', color: '#fed7aa' }}>{graduationInfo.dps.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: colors.text.muted, padding: '16px' }}>毕业率未配置</div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.04) 50%, rgba(34, 197, 94, 0.08) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 装饰性角落 */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '80px',
              height: '80px',
              borderBottomLeftRadius: '100%',
              background: 'linear-gradient(225deg, rgba(34, 197, 94, 0.15) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  fontSize: '11px',
                }}>📊</span>
                <span style={{ color: 'rgba(34, 197, 94, 0.8)', fontSize: '12px', fontWeight: '500' }}>面板属性</span>
              </div>
              {statDisplay.length === 0 ? (
                <div style={{ textAlign: 'center', color: colors.text.muted, padding: '16px' }}>暂无面板属性</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px 24px' }}>
                  {statDisplay.map((item) => {
                    const hasBothMarks = item.isLoaned && item.isEarlySeason;
                    const bgColor = hasBothMarks
                      ? 'linear-gradient(90deg, rgba(167, 139, 250, 0.15) 0%, rgba(34, 211, 238, 0.15) 100%)'
                      : item.isLoaned
                        ? 'rgba(167, 139, 250, 0.12)'
                        : item.isEarlySeason
                          ? 'rgba(34, 211, 238, 0.12)'
                          : 'rgba(30, 41, 59, 0.4)';
                    const labelColor = hasBothMarks || item.isLoaned
                      ? '#d8b4fe'
                      : item.isEarlySeason
                        ? '#67e8f9'
                        : '#94a3b8';
                    const valueColor = hasBothMarks || item.isLoaned
                      ? '#e9d5ff'
                      : item.isEarlySeason
                        ? '#a5f3fc'
                        : '#e2e8f0';

                    return (
                      <div
                        key={item.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: bgColor,
                          gap: '8px',
                          minWidth: 0,
                          border: hasBothMarks 
                            ? '1px solid rgba(167, 139, 250, 0.2)' 
                            : item.isLoaned 
                              ? '1px solid rgba(167, 139, 250, 0.15)'
                              : item.isEarlySeason
                                ? '1px solid rgba(34, 211, 238, 0.15)'
                                : '1px solid transparent',
                        }}
                      >
                        <span style={{ 
                          fontSize: '12px', 
                          color: labelColor,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}>
                          {(item.isLoaned || item.isEarlySeason) && (
                            <span style={{ fontSize: '10px', flexShrink: 0 }}>
                              {item.isLoaned && '💰'}
                              {item.isEarlySeason && '⏩'}
                            </span>
                          )}
                          {item.label}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: valueColor,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          textAlign: 'right',
                        }}>
                          {item.value}
                          {item.highlight && (
                            <span style={{ color: '#fbbf24', marginLeft: '2px' }}>{item.highlight}</span>
                          )}
                          {item.suffix && (
                            <span style={{ color: '#64748b', fontSize: '10px', marginLeft: '1px' }}>{item.suffix}</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(71, 85, 105, 0.5)', textAlign: 'center' }}>
            <div style={{ color: colors.text.muted, fontSize: '12px' }}>
              生成时间：{new Date().toLocaleString('zh-CN')}
            </div>
          </div>
          </div>
        </div>

        {/* Fixed Download Button Footer */}
        <DialogFooter className="shrink-0 px-6 py-4 border-t border-slate-700/50 bg-slate-900">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? '生成中...' : '下载报告'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
