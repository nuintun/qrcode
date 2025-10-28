/**
 * @module useLatestCallback
 */

import { useRef } from 'react';
import useLatestRef from './useLatestRef';

export interface Callback {
  (this: unknown, ...args: any[]): any;
}

/**
 * @function useLatestCallback
 * @description [hook] 持久化可获取最新上下文的回调函数
 * @param callback 待处理的回调函数
 */
export default function useLatestCallback<C extends Callback>(callback: C): C {
  const callbackRef = useLatestRef(callback);
  const latestCallbackRef = useRef<C | null>(null);

  if (latestCallbackRef.current == null) {
    latestCallbackRef.current = function (this, ...args) {
      return callbackRef.current.apply(this, args);
    } as C;
  }

  return latestCallbackRef.current;
}
