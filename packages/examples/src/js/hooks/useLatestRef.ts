/**
 * @module useLatestRef
 */

import React, { useMemo, useRef } from 'react';

/**
 * @function useLatestRef
 * @description 生成自更新 useRef 对象
 */
export default function useLatestRef<T = undefined>(): React.MutableRefObject<T | undefined>;
/**
 * @function useLatestRef
 * @description 生成自更新 useRef 对象
 * @param value 引用值
 */
export default function useLatestRef<T>(value: T): React.MutableRefObject<T>;
export default function useLatestRef<T = undefined>(value?: T): React.MutableRefObject<T | undefined> {
  const valueRef = useRef(value);

  // https://github.com/alibaba/hooks/issues/728
  valueRef.current = useMemo(() => value, [value]);

  return valueRef;
}
