/**
 * @module useIsMounted
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * @function useIsMounted
 * @description [hook] 检查组件是否已经挂载
 */
export default function useIsMounted(): () => boolean {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}
