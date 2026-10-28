/**
 * @module useI18n
 */

import { useSyncExternalStore } from 'react';
import { antdLocales, getLang, setLang, subscribe, translate } from '/js/i18n';

export type { Lang } from '/js/i18n';

/**
 * `translate` reads the current language at call time, so event callbacks can
 * capture it freely; but its identity never changes — render-path caches
 * (useMemo/useCallback) must depend on `lang` instead of `translate`.
 */
export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getLang);

  return { lang, setLang, translate, antdLocale: antdLocales[lang] };
}
