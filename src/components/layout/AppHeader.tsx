'use client';

import { FileImage, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { LocaleSwitcher } from '@/components/common';
import { Button } from '@/components/ui/button';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('header');

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

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/30 border border-slate-600/30 text-slate-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Account selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <span className="text-slate-400 text-xs">{t('currentCharacter')}</span>
            <Select
              value={currentAccount ?? ''}
              onValueChange={(value) => onAccountChange(value || null)}
            >
              <SelectTrigger className="w-[120px] lg:w-[160px] cursor-pointer border-slate-600/50 bg-slate-800/50 text-slate-100 hover:bg-slate-700/50">
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

          <div className="h-6 w-px bg-slate-600/40" />

          {/* Create account */}
          <div className="flex items-center gap-2">
            <input
              className="h-9 w-28 lg:w-36 rounded-md border border-slate-600/50 bg-slate-800/50 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
              placeholder={t('newCharacterPlaceholder')}
              value={createName}
              onChange={(event) => onCreateNameChange(event.target.value)}
            />
            <Button
              size="sm"
              className="cursor-pointer bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-md shadow-slate-900/30"
              onClick={onCreateAccount}
            >
              {t('create')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={onDeleteAccount}
              disabled={!currentAccount}
            >
              {t('delete')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer border-slate-600/50 text-slate-300 hover:bg-slate-700/30 hover:text-slate-200"
              onClick={onImportExport}
              disabled={!currentAccount}
            >
              {t('importExport')}
            </Button>
            <Button
              size="sm"
              className="cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20"
              onClick={onGenerateReport}
              disabled={!currentAccount}
            >
              <FileImage className="w-4 h-4 mr-1" />
              {t('generateReport')}
            </Button>
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/98 backdrop-blur-md border-b border-slate-700/50 p-4 space-y-4 z-50">
          {/* Language Switcher */}
          <div className="flex justify-end">
            <LocaleSwitcher />
          </div>

          {/* Account selector */}
          <div className="space-y-2">
            <span className="text-slate-400 text-xs">{t('currentCharacter')}</span>
            <Select
              value={currentAccount ?? ''}
              onValueChange={(value) => {
                onAccountChange(value || null);
                setMobileMenuOpen(false);
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

          {/* Create account */}
          <div className="space-y-2">
            <span className="text-slate-400 text-xs">{t('newCharacter')}</span>
            <div className="flex gap-2">
              <input
                className="flex-1 h-9 rounded-md border border-slate-600/50 bg-slate-800/50 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                placeholder={t('characterName')}
                value={createName}
                onChange={(event) => onCreateNameChange(event.target.value)}
              />
              <Button
                size="sm"
                className="cursor-pointer bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-md shadow-slate-900/30"
                onClick={() => {
                  onCreateAccount();
                  setMobileMenuOpen(false);
                }}
              >
                {t('create')}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                onClick={() => {
                  onDeleteAccount();
                  setMobileMenuOpen(false);
                }}
                disabled={!currentAccount}
              >
                {t('deleteCharacter')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 cursor-pointer border-slate-600/50 text-slate-300 hover:bg-slate-700/30 hover:text-slate-200"
                onClick={() => {
                  onImportExport();
                  setMobileMenuOpen(false);
                }}
                disabled={!currentAccount}
              >
                {t('importExport')}
              </Button>
            </div>
            <Button
              size="sm"
              className="w-full cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20"
              onClick={() => {
                onGenerateReport();
                setMobileMenuOpen(false);
              }}
              disabled={!currentAccount}
            >
              <FileImage className="w-4 h-4 mr-1" />
              {t('generateReport')}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
