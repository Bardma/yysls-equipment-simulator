'use client';

import { ChevronDown, FileImage, Plus, Trash2, Upload, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { LocaleSwitcher } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AppHeaderProps {
  accounts: string[];
  currentAccount: string | null;
  createName: string;
  onCreateNameChange: (name: string) => void;
  onAccountChange: (account: string | null) => void;
  onCreateAccount: () => void;
  onDeleteAccount: () => void;
  onImportExport: () => void;
  onGenerateReport: () => void;
}

export const AppHeader = ({
  accounts,
  currentAccount,
  createName,
  onCreateNameChange,
  onAccountChange,
  onCreateAccount,
  onDeleteAccount,
  onImportExport,
  onGenerateReport,
}: AppHeaderProps) => {
  const [characterMenuOpen, setCharacterMenuOpen] = useState(false);
  const t = useTranslations('header');

  const handleCreateAccount = () => {
    onCreateAccount();
    // ChuangJianChengGongHouQingKongShuRuKuang（JiaSheFuZuJianHuiChuLi）
  };

  const handleDeleteAccount = () => {
    onDeleteAccount();
    setCharacterMenuOpen(false);
  };

  const handleImportExport = () => {
    onImportExport();
    setCharacterMenuOpen(false);
  };

  return (
    <header className="relative z-50 w-full shrink-0 border-b border-slate-700/50 bg-linear-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md">
      <div className="absolute inset-0 bg-linear-to-r from-slate-500/5 via-transparent to-slate-500/5 pointer-events-none" />
      <div className="container relative mx-auto flex h-14 md:h-16 max-w-screen-2xl items-center justify-between px-3 md:px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-linear-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-900/50 border border-slate-500/20">
            <span className="text-white text-base md:text-lg">⚔</span>
          </div>
          <div>
            <div className="font-bold tracking-tight text-base md:text-lg bg-linear-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent">
              {t('title')}
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 -mt-0.5 hidden sm:block">{t('subtitle')}</div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Character Management Popover */}
          <Popover open={characterMenuOpen} onOpenChange={setCharacterMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-slate-600/50 bg-slate-800/50 text-slate-100 hover:bg-slate-700/50 hover:text-white gap-1.5 px-2.5 md:px-3"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span className="max-w-[80px] md:max-w-[120px] truncate">
                  {currentAccount || t('noCharacter')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[calc(100vw-24px)] max-w-[320px] p-0 border-slate-600/50 bg-slate-900/98 backdrop-blur-md"
              align="end"
              sideOffset={8}
            >
              <div className="p-3 space-y-3">
                {/* Switch Character Section */}
                {accounts.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">{t('switchCharacter')}</label>
                    <Select
                      value={currentAccount ?? ''}
                      onValueChange={(value) => {
                        onAccountChange(value || null);
                        setCharacterMenuOpen(false);
                      }}
                    >
                      <SelectTrigger className="w-full cursor-pointer border-slate-600/50 bg-slate-800/50 text-slate-100 hover:bg-slate-700/50">
                        <SelectValue placeholder={t('selectCharacter')} />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account} value={account}>
                            {account}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Create Character Section */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">{t('newCharacter')}</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-9 rounded-md border border-slate-600/50 bg-slate-800/50 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                      placeholder={t('newCharacterPlaceholder')}
                      value={createName}
                      onChange={(event) => onCreateNameChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && createName.trim()) {
                          handleCreateAccount();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="cursor-pointer bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-md shadow-slate-900/30 px-3"
                      onClick={handleCreateAccount}
                      disabled={!createName.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                {currentAccount && (
                  <>
                    <div className="h-px bg-slate-700/50" />

                    {/* Character Actions */}
                    <div className="space-y-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full justify-start cursor-pointer text-slate-300 hover:text-slate-100 hover:bg-slate-700/30 gap-2"
                        onClick={handleImportExport}
                      >
                        <Upload className="w-4 h-4" />
                        {t('importExport')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full justify-start cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-2"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('deleteCharacter')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Generate Report Button */}
          <Button
            size="sm"
            className="cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20 px-2.5 md:px-3"
            onClick={onGenerateReport}
            disabled={!currentAccount}
          >
            <FileImage className="w-4 h-4 md:mr-1.5" />
            <span className="hidden md:inline">{t('generateReport')}</span>
          </Button>

          {/* Language Switcher */}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
};
