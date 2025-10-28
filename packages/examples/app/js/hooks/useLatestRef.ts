/**
 * @module useLatestRef
 */

import React, { useMemo, useRef } from 'react';

/**
 * @function useLatestRef
 * @description [hook] 生成自更新 useRef 对象
 * @param value 引用值
 */
export default function useLatestRef<T>(value: T): React.RefObject<T>;
/**
 * @function useLatestRef
 * @description [hook] 生成自更新 useRef 对象
 * @param value 引用值
 */
export default function useLatestRef<T>(value: T | null): React.RefObject<T | null>;
/**
 * @function useLatestRef
 * @description [hook] 生成自更新 useRef 对象
 * @param value 引用值
 */
export default function useLatestRef<T>(value: T | undefined): React.RefObject<T | undefined>;
/**
 * @function useLatestRef
 * @description [hook] 生成自更新 useRef 对象
 * @param value 引用值
 */
export default function useLatestRef<T>(value: T | null | undefined): React.RefObject<T | null | undefined> {
  const valueRef = useRef<T | null | undefined>(value);

  // https://github.com/alibaba/hooks/issues/728
  valueRef.current = useMemo(() => value, [value]);

  return valueRef;
}
