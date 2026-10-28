/**
 * @module index
 */

import dictEn from './en-US';
import dictZh from './zh-CN';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { isObject, isString } from '/js/utils/typeof';

export type Lang = 'zh-CN' | 'en-US';

export const antdLocales = {
  'zh-CN': zhCN,
  'en-US': enUS
};

const STORAGE_KEY = 'qrcode-lang';

const listeners = new Set<() => void>();

const dictionaries: Record<Lang, typeof dictZh> = {
  'zh-CN': dictZh,
  'en-US': dictEn
};

function getInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY) as Lang;

  switch (stored) {
    case 'zh-CN':
    case 'en-US':
      return stored;
    default:
      return /^en(?:-|$)/i.test(navigator.language) ? 'en-US' : 'zh-CN';
  }
}

// Module-level singleton: the language must be synchronously readable outside
// the React render cycle (event callbacks with stale closures), and it doubles
// as the in-memory fallback when localStorage is unavailable.
let current: Lang = getInitialLang();

export function getLang(): Lang {
  return current;
}

export function setLang(next: Lang): void {
  if (next !== current) {
    current = next;

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort.
    }

    for (const listener of listeners) {
      listener();
    }
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function translate(key: string, params?: Record<string, unknown>): string {
  let node: unknown = dictionaries[current];

  for (const part of key.split('.')) {
    if (isObject(node) && Object.hasOwn(node, part)) {
      node = node[part];
    } else {
      // Missing key renders the key itself, which makes typos visible in UI.
      return key;
    }
  }

  let text = isString(node) ? node : key;

  if (params) {
    // Longest first, so a `{n}` replacement cannot clobber a `{name}` placeholder.
    const entries = Object.entries(params).sort((a, b) => b[0].length - a[0].length);

    for (const [name, value] of entries) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }

  return text;
}
