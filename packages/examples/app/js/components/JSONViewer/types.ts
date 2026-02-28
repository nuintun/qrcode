/**
 * @module types
 * @description JSON 查看器类型定义
 */

import React from 'react';

/**
 * @enum {number} ValueType
 * @description 值的类型枚举，用于内部类型识别和处理
 * @member {number} DATE Date 对象类型
 * @member {number} NULL null 值类型
 * @member {number} ARRAY 数组类型
 * @member {number} NUMBER 数字类型（包括整数和浮点数）
 * @member {number} OBJECT 对象类型
 * @member {number} STRING 字符串类型
 * @member {number} BOOLEAN 布尔类型
 * @member {number} UNKNOWN 不支持的类型（Symbol、Function）等
 */
export enum ValueType {
  DATE,
  NULL,
  ARRAY,
  NUMBER,
  OBJECT,
  STRING,
  BOOLEAN,
  UNKNOWN
}

/**
 * @typedef {ValueType.ARRAY | ValueType.OBJECT} ReferenceType
 * @description 引用类型标识（数组或对象）
 */
export type ReferenceType = ValueType.ARRAY | ValueType.OBJECT;

/**
 * @interface ColorTheme
 * @description 色彩主题配置接口，定义 JSON 各部分的颜色
 * @property {string} [key] 键名颜色
 * @property {string} [string] 字符串值颜色
 * @property {string} [number] 数字值颜色
 * @property {string} [boolean] 布尔值颜色
 * @property {string} [null] 空值颜色
 * @property {string} [circular] 循环引用标识颜色
 * @property {string} [bracket] 括号颜色
 * @property {string} [punctuation] 标点符号（如逗号、冒号）颜色
 */
export interface ColorTheme {
  key?: string;
  string?: string;
  number?: string;
  boolean?: string;
  null?: string;
  circular?: string;
  bracket?: string;
  punctuation?: string;
}

/**
 * @interface JSONViewerProps
 * @description JSON 查看器组件属性配置
 * @property {unknown} data 待查看 JSON 数据
 * @property {ColorTheme} [theme] 颜色主题配置
 * @property {string} [className] 外层容器的自定义 CSS 类名
 * @property {number} [indentSize] 缩进空格数，默认值 2
 * @property {React.CSSProperties} [style] 外层容器的自定义内联样式
 */
export interface JSONViewerProps {
  data: unknown;
  theme?: ColorTheme;
  className?: string;
  indentSize?: number;
  style?: React.CSSProperties;
}

/**
 * @interface StackFrame
 * @description 栈帧，表示数组或对象在遍历过程中的状态
 * @property {number} depth 源数据层级
 * @property {boolean} opened 源数据是否已打开
 * @property {number} rendered 已渲染的子节点次数
 * @property {ReferenceType} type 源数据类型
 * @property {object | unknown[]} source 源数据
 * @property {IterableIterator<[string, unknown] | [number, unknown]>} entries 源数据迭代器
 */
export interface StackFrame {
  depth: number;
  opened: boolean;
  rendered: number;
  type: ReferenceType;
  source: object | unknown[];
  entries: IterableIterator<[string, unknown] | [number, unknown]>;
}
