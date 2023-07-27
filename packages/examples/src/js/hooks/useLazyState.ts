/**
 * @module useLazyState
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import useLatestRef from './useLatestRef';

/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S>(
  initialState: S | (() => S),
  delay?: number
): [state: S, setLazyState: (value: React.SetStateAction<S>, delay?: number) => void];
/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S = undefined>(
  initialState?: S | (() => S),
  delay?: number
): [state: S | undefined, setLazyState: (value: React.SetStateAction<S | undefined>, delay?: number) => void];
export default function useLazyState<S = undefined>(
  initialState?: S | (() => S),
  delay: number = 128
): [state: S | undefined, setLazyState: (value: React.SetStateAction<S | undefined>, delay?: number) => void] {
  const timerRef = useRef<Timeout>();
  const delayRef = useLatestRef(delay);
  const [state, setState] = useState(initialState);

  const setLazyState = useCallback((value: React.SetStateAction<S | undefined>, delay: number = delayRef.current): void => {
    clearTimeout(timerRef.current);

    if (delay <= 0) {
      setState(value);
    } else {
      timerRef.current = setTimeout(() => {
        setState(value);
      }, delay);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  return [state, setLazyState];
}
