'use client';

import { pinyin } from 'pinyin-pro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { EquipItem } from '@/lib/types';

// jieba-wasm 动态导入类型
type JiebaModule = {
  cut: (text: string, hmm?: boolean) => string[];
  cut_for_search: (text: string, hmm?: boolean) => string[];
};

// 拼音缓存，避免重复计算
const pinyinCache = new Map<string, { full: string; initials: string }>();

/**
 * 获取文本的拼音（全拼和首字母）
 */
function getPinyin(text: string): { full: string; initials: string } {
  if (!text) return { full: '', initials: '' };

  const cached = pinyinCache.get(text);
  if (cached) return cached;

  // 全拼（无声调，无空格）
  const full = pinyin(text, { toneType: 'none', type: 'array' }).join('').toLowerCase();
  // 首字母
  const initials = pinyin(text, { pattern: 'first', type: 'array' }).join('').toLowerCase();

  const result = { full, initials };
  pinyinCache.set(text, result);
  return result;
}

/**
 * 检查是否为拼音字符（只包含英文字母）
 */
function isPinyinQuery(query: string): boolean {
  return /^[a-zA-Z]+$/.test(query);
}

/**
 * 使用 jieba-wasm 进行中文分词搜索的 hook
 * 支持中文搜索和拼音搜索（全拼/首字母）
 */
export function useJiebaSearch(items: EquipItem[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isReady, setIsReady] = useState(false);
  const jiebaRef = useRef<JiebaModule | null>(null);

  // 初始化 jieba-wasm
  useEffect(() => {
    let mounted = true;

    const initJieba = async () => {
      try {
        const jiebaWasm = await import('jieba-wasm');
        // 浏览器端需要先初始化
        if (jiebaWasm.default) {
          await jiebaWasm.default();
        }
        if (mounted) {
          jiebaRef.current = jiebaWasm as unknown as JiebaModule;
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize jieba-wasm:', error);
        // 即使初始化失败，也标记为就绪，使用降级的简单搜索
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

  // 预计算所有装备名称的拼音
  const itemsWithPinyin = useMemo(() => {
    return items.map((item) => ({
      ...item,
      pinyin: getPinyin(item.name),
    }));
  }, [items]);

  // 对文本进行分词
  const tokenize = useCallback((text: string): string[] => {
    if (!text) return [];

    // 如果 jieba 可用，使用分词
    if (jiebaRef.current) {
      try {
        // 使用 cut_for_search 获取更多匹配可能
        return jiebaRef.current.cut_for_search(text, true);
      } catch {
        // 降级到简单分词
      }
    }

    // 降级：简单按字符分割
    return text.split('');
  }, []);

  // 检查是否匹配（支持中文和拼音）
  const isMatch = useCallback(
    (
      itemName: string,
      itemPinyin: { full: string; initials: string },
      query: string
    ): boolean => {
      if (!query.trim()) return true;

      const normalizedQuery = query.toLowerCase().trim();
      const normalizedName = itemName.toLowerCase();

      // 1. 直接包含匹配（优先）
      if (normalizedName.includes(normalizedQuery)) {
        return true;
      }

      // 2. 拼音匹配（如果查询是纯英文字母）
      if (isPinyinQuery(normalizedQuery)) {
        // 全拼匹配
        if (itemPinyin.full.includes(normalizedQuery)) {
          return true;
        }
        // 首字母匹配
        if (itemPinyin.initials.includes(normalizedQuery)) {
          return true;
        }
        // 全拼开头匹配
        if (itemPinyin.full.startsWith(normalizedQuery)) {
          return true;
        }
        // 首字母开头匹配
        if (itemPinyin.initials.startsWith(normalizedQuery)) {
          return true;
        }
      }

      // 3. 分词匹配
      const queryTokens = tokenize(normalizedQuery);
      const nameTokens = tokenize(normalizedName);

      // 查询的每个词都需要在名称中找到匹配
      return queryTokens.every((queryToken) => {
        if (!queryToken.trim()) return true;
        // 检查是否有任何名称词包含查询词，或查询词包含名称词
        return nameTokens.some(
          (nameToken) => nameToken.includes(queryToken) || queryToken.includes(nameToken)
        );
      });
    },
    [tokenize]
  );

  // 过滤结果
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
