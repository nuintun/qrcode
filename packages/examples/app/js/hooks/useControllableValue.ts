/**
 * @module useControllableValue
 */

import useIsMounted from './useIsMounted';
import useLatestRef from './useLatestRef';
import { isFunction } from '/js/utils/utils';
import React, { useCallback, useEffect, useState } from 'react';

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
 * @function getValue
 * @param props 组件 Props
 * @param options 配置选项
 */
function getValue<V>(props: Props, options: Options<V>): V {
  const valuePropName = getValuePropName(options);

  return props[valuePropName];
}

/**
 * @function getDefaultValue
 * @param props 组件 Props
 * @param options 配置选项
 */
function getDefaultValue<V>(props: Props, options: Options<V>): V {
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
  const propsRef = useLatestRef(props);
  const optionsRef = useLatestRef(options);

  const [value = options.defaultValue, setState] = useState<V | undefined>(() => {
    if (isControlled(props, options)) {
      return getValue(props, options);
    }

    return getDefaultValue(props, options);
  });

  const valueRef = useLatestRef(value);

  const setValue = useCallback((value: React.SetStateAction<V | undefined>, ...args: any[]): void => {
    if (isMounted()) {
      const { current: prevState } = valueRef;
      const state = isFunction(value) ? value(prevState) : value;

      if (state !== prevState) {
        const { current: props } = propsRef;
        const { trigger = 'onChange' } = props;
        const { current: options } = optionsRef;

        if (!isControlled(props, options)) {
          setState(state);
        }

        if (isFunction(props[trigger])) {
          props[trigger](state, ...args);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isControlled(props, options)) {
      const nextValue = getValue(props, options);

      if (nextValue !== value) {
        setState(nextValue);
      }
    }
  });

  return [value, setValue];
}
