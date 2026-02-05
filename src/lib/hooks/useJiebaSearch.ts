'use client';

import { pinyin } from 'pinyin-pro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { EquipItem } from '@/lib/types';

// jieba-wasm DongTaiImportLeiXing
type JiebaModule = {
  cut: (text: string, hmm?: boolean) => string[];
  cut_for_search: (text: string, hmm?: boolean) => string[];
};

// PinYinHuanCun，BiMianChongFuJiSuan
const pinyinCache = new Map<string, { full: string; initials: string }>();

/**
 * HuoQuWenBenDePinYin（QuanPinHeShouZiMu）
 */
function getPinyin(text: string): { full: string; initials: string } {
  if (!text) return { full: '', initials: '' };

  const cached = pinyinCache.get(text);
  if (cached) return cached;

  // QuanPin（NoneShengDiao，NoneKongGe）
  const full = pinyin(text, { toneType: 'none', type: 'array' }).join('').toLowerCase();
  // ShouZiMu
  const initials = pinyin(text, { pattern: 'first', type: 'array' }).join('').toLowerCase();

  const result = { full, initials };
  pinyinCache.set(text, result);
  return result;
}

/**
 * JianChaShiFouWeiPinYinZiFu（ZhiBaoHanYingWenZiMu）
 */
function isPinyinQuery(query: string): boolean {
  return /^[a-zA-Z]+$/.test(query);
}

/**
 * ShiYong jieba-wasm JinXingZhongWenFenCiSouSuoDe hook
 * ZhiChiZhongWenSouSuoHePinYinSouSuo（QuanPin/ShouZiMu）
 */
export function useJiebaSearch(items: EquipItem[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isReady, setIsReady] = useState(false);
  const jiebaRef = useRef<JiebaModule | null>(null);

  // ChuShiHua jieba-wasm
  useEffect(() => {
    let mounted = true;

    const initJieba = async () => {
      try {
        const jiebaWasm = await import('jieba-wasm');
        // LiuLanQiDuanXuYaoXianChuShiHua
        if (jiebaWasm.default) {
          await jiebaWasm.default();
        }
        if (mounted) {
          jiebaRef.current = jiebaWasm as unknown as JiebaModule;
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize jieba-wasm:', error);
        // JiShiChuShiHuaShiBai，YeBiaoJiWeiJiuXu，ShiYongJiangJiDeJianDanSouSuo
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    initJieba();

    return () => {
      mounted = false;
    };
  }, []);

  // YuJiSuanSuoYouEquipmentMingChengDePinYin
  const itemsWithPinyin = useMemo(() => {
    return items.map((item) => ({
      ...item,
      pinyin: getPinyin(item.name),
    }));
  }, [items]);

  // DuiWenBenJinXingFenCi
  const tokenize = useCallback((text: string): string[] => {
    if (!text) return [];

    // RuGuo jieba KeYong，ShiYongFenCi
    if (jiebaRef.current) {
      try {
        // ShiYong cut_for_search HuoQuGengDuoPiPeiKeNeng
        return jiebaRef.current.cut_for_search(text, true);
      } catch {
        // JiangJiDaoJianDanFenCi
      }
    }

    // JiangJi：JianDanAnZiFuFenGe
    return text.split('');
  }, []);

  // JianChaShiFouPiPei（ZhiChiZhongWenHePinYin）
  const isMatch = useCallback(
    (
      itemName: string,
      itemPinyin: { full: string; initials: string },
      query: string
    ): boolean => {
      if (!query.trim()) return true;

      const normalizedQuery = query.toLowerCase().trim();
      const normalizedName = itemName.toLowerCase();

      // 1. ZhiJieBaoHanPiPei（YouXian）
      if (normalizedName.includes(normalizedQuery)) {
        return true;
      }

      // 2. PinYinPiPei（RuGuoChaXunShiChunYingWenZiMu）
      if (isPinyinQuery(normalizedQuery)) {
        // QuanPinPiPei
        if (itemPinyin.full.includes(normalizedQuery)) {
          return true;
        }
        // ShouZiMuPiPei
        if (itemPinyin.initials.includes(normalizedQuery)) {
          return true;
        }
        // QuanPinKaiTouPiPei
        if (itemPinyin.full.startsWith(normalizedQuery)) {
          return true;
        }
        // ShouZiMuKaiTouPiPei
        if (itemPinyin.initials.startsWith(normalizedQuery)) {
          return true;
        }
      }

      // 3. FenCiPiPei
      const queryTokens = tokenize(normalizedQuery);
      const nameTokens = tokenize(normalizedName);

      // ChaXunDeMeiGeCiDouXuYaoZaiMingChengZhongZhaoDaoPiPei
      return queryTokens.every((queryToken) => {
        if (!queryToken.trim()) return true;
        // JianChaShiFouYouRenHeMingChengCiBaoHanChaXunCi，HuoChaXunCiBaoHanMingChengCi
        return nameTokens.some(
          (nameToken) => nameToken.includes(queryToken) || queryToken.includes(nameToken)
        );
      });
    },
    [tokenize]
  );

  // GuoLJieGuo
  const filteredItems = useMemo(() => {
    return itemsWithPinyin.filter((item) => isMatch(item.name, item.pinyin, searchQuery));
  }, [itemsWithPinyin, isMatch, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    isReady,
  };
}
