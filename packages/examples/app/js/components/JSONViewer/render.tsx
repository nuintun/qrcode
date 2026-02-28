/**
 * @module render
 * @description JSON 查看器渲染层逻辑
 */

import React from 'react';
import { ValueType } from './types';

/**
 * @function renderPrimitiveValue
 * @description 渲染基本类型的值（null、boolean、number、string、date）
 * @param {React.Key} key React 元素唯一键
 * @param {unknown} value 要渲染的值
 * @param {ValueType} valueType 值的类型（必须是基本类型）
 * @param {Record<string, React.CSSProperties>} valueStyles 样式对象
 * @returns {React.ReactElement} 渲染后的 React 元素
 */
export function renderPrimitiveValue(
  key: React.Key,
  value: unknown,
  valueType: ValueType,
  valueStyles: Record<string, React.CSSProperties>
): React.ReactElement {
  switch (valueType) {
    case ValueType.NULL:
      return (
        <span key={key} style={valueStyles.null}>
          null
        </span>
      );
    case ValueType.STRING:
      return (
        <span key={key} style={valueStyles.string}>
          {JSON.stringify(value)}
        </span>
      );
    case ValueType.NUMBER:
      return (
        <span key={key} style={valueStyles.number}>
          {value as number}
        </span>
      );
    case ValueType.BOOLEAN:
      return (
        <span key={key} style={valueStyles.boolean}>
          {(value as boolean) ? 'true' : 'false'}
        </span>
      );
    case ValueType.DATE:
      return (
        <span key={key} style={valueStyles.string}>
          "{(value as Date).toISOString()}"
        </span>
      );
    default:
      throw new TypeError(`invalid primitive value: ${value}`);
  }
}

/**
 * @function renderCircularValue
 * @description 渲染循环引用标识 "[Circular]"
 * @param {React.Key} key React 元素唯一键
 * @param {Record<string, React.CSSProperties>} valueStyles 样式对象（需包含 circular 样式）
 * @returns {React.ReactElement} 渲染后的循环引用标识
 */
export function renderCircularValue(key: React.Key, valueStyles: Record<string, React.CSSProperties>): React.ReactElement {
  return (
    <span key={key} style={valueStyles.circular}>
      [Circular]
    </span>
  );
}

/**
 * @function renderBracket
 * @description 渲染数组或对象的括号（左括号或右括号）
 * @param {React.Key} key React 元素唯一键
 * @param {boolean} isOpen 是否为左括号（true 表示左括号，false 表示右括号）
 * @param {ValueType} valueType 数据类型（数组或对象）
 * @param {React.CSSProperties} bracketStyle 括号样式
 * @returns {React.ReactElement} 渲染后的括号元素
 */
export function renderBracket(
  key: React.Key,
  isOpen: boolean,
  valueType: ValueType,
  bracketStyle: React.CSSProperties
): React.ReactElement {
  const isObject = valueType === ValueType.OBJECT;

  return (
    <span key={key} style={bracketStyle}>
      {isObject ? (isOpen ? '{' : '}') : isOpen ? '[' : ']'}
    </span>
  );
}
