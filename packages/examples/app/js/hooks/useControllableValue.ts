/**
 * @module useControllableValue
 */

import useIsMounted from './useIsMounted';
import { shallowEqual } from 'fast-equals';
import { isFunction } from '/js/utils/utils';
import React, { useEffect, useState } from 'react';
import useLatestCallback from './useLatestCallback';

export interface Props {
  [prop: string]: any;
}

export interface Options<V> {
  trigger?: string;
  defaultValue?: V;
  valuePropName?: string;
  defaultValuePropName?: string;
}

export interface SetValueAction<V> {
  (value: React.SetStateAction<V>, ...args: unknown[]): void;
}

/**
 * @function getValuePropName
 * @param options 配置选项
 */
function getValuePropName<V>(options: Options<V>): string {
  const { valuePropName = 'value' } = options;

  return valuePropName;
}

/**
 * @function getDefaultValuePropName
 * @param options 配置选项
 */
function getDefaultValuePropName<V>(options: Options<V>): string {
  const { defaultValuePropName = 'defaultValue' } = options;

  return defaultValuePropName;
}

/**
 * @function isControlled
 * @param props 组件 Props
 * @param options 配置选项
 */
function isControlled<V>(props: Props, options: Options<V>): boolean {
  const valuePropName = getValuePropName(options);

  return valuePropName in props;
}

/**
 * @function getState
 * @param props 组件 Props
 * @param options 配置选项
 */
function getState<V>(props: Props, options: Options<V>): V {
  const valuePropName = getValuePropName(options);

  return props[valuePropName];
}

/**
 * @function getDefaultState
 * @param props 组件 Props
 * @param options 配置选项
 */
function getDefaultState<V>(props: Props, options: Options<V>): V {
  const defaultValuePropName = getDefaultValuePropName(options);

  return props[defaultValuePropName];
}

/**
 * @function useControllableValue
 * @description [hook] 生成同时支持受控和非受控状态的值
 * @param props 组件 Props
 * @param options 配置选项
 */
export default function useControllableValue<V>(
  props: Props,
  options: Options<V> & { defaultValue: V }
): [value: V, setValue: SetValueAction<V>];
/**
 * @function useControllableValue
 * @description [hook] 生成同时支持受控和非受控状态的值
 * @param props 组件 Props
 * @param options 配置选项
 */
export default function useControllableValue<V = undefined>(
  props: Props,
  options?: Omit<Options<V>, 'defaultValue'>
): [value: V | undefined, setValue: SetValueAction<V | undefined>];
/**
 * @function useControllableValue
 * @description [hook] 生成同时支持受控和非受控状态的值
 * @param props 组件 Props
 * @param options 配置选项
 */
export default function useControllableValue<V = undefined>(
  props: Props,
  options: Options<V> = {}
): [value: V | undefined, setValue: SetValueAction<V | undefined>] {
  const isMounted = useIsMounted();

  const [currentState = options.defaultValue, setState] = useState<V | undefined>(() => {
    if (isControlled(props, options)) {
      return getState(props, options);
    }

    return getDefaultState(props, options);
  });

  const setValue = useLatestCallback((value: React.SetStateAction<V | undefined>, ...args: unknown[]): void => {
    if (isMounted()) {
      const state = currentState ?? options.defaultValue;
      const nextState = isFunction(value) ? value(state) : value;

      if (!shallowEqual(nextState, state)) {
        const { trigger = 'onChange' } = props;

        if (!isControlled(props, options)) {
          setState(nextState);
        }

        if (isFunction(props[trigger])) {
          props[trigger](nextState, ...args);
        }
      }
    }
  });

  useEffect(() => {
    if (isControlled(props, options)) {
      const nextState = getState(props, options);

      if (!shallowEqual(nextState, currentState)) {
        setState(nextState);
      }
    }
  });

  return [currentState, setValue];
}
