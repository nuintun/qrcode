/**
 * @module utils
 * @description JSON 查看器工具函数、常量及栈逻辑
 */

import { ColorTheme, ReferenceType, StackFrame, ValueType } from './types';

/**
 * @constant LINE_FEED
 * @description 换行符常量，用于格式化输出
 * @type {string}
 */
export const LINE_FEED = '\n';

/**
 * @constant DEFAULT_THEME
 * @description 默认颜色主题，采用醒目的颜色区分各语法部分
 * @type {Required<ColorTheme>}
 */
export const DEFAULT_THEME: Required<ColorTheme> = {
  key: '#c00',
  string: '#008000',
  number: '#00c',
  boolean: '#800080',
  null: '#6a6a6a',
  circular: '#f60',
  bracket: '#333',
  punctuation: '#333'
};

/**
 * @constant indents
 * @description 缩进字符串缓存，避免重复生成相同缩进字符串，提升性能
 * @type {Map<number, string>}
 */
export const indents = new Map<number, string>();

/**
 * @function getIndent
 * @description 根据缩进大小和层级生成缩进字符串（使用空格），结果会被缓存
 * @param {number} size 单个层级的空格数
 * @param {number} depth 缩进层级（0 表示无缩进）
 * @returns {string} 缩进字符串
 */
export function getIndent(size: number, depth: number): string {
  const length = size * depth;

  let indent = indents.get(length);

  if (indent == null) {
    indent = ' '.repeat(length);

    indents.set(length, indent);
  }

  return indent;
}

/**
 * @function getValueType
 * @description 获取任意值的类型，用于后续的差异化处理
 * @param {unknown} value 要判断的值
 * @returns {ValueType} 值的类型枚举
 */
export function getValueType(value: unknown): ValueType {
  if (value === null) {
    return ValueType.NULL;
  }

  if (Array.isArray(value)) {
    return ValueType.ARRAY;
  }

  switch (Object.prototype.toString.call(value)) {
    case '[object Date]':
      return ValueType.DATE;
    case '[object String]':
      return ValueType.STRING;
    case '[object Boolean]':
      return ValueType.BOOLEAN;
    case '[object Symbol]':
    case '[object BigInt]':
    case '[object Function]':
    case '[object Undefined]':
    case '[object AsyncFunction]':
      return ValueType.UNKNOWN;
    case '[object Number]':
      if (
        // NaN
        value !== value ||
        // Infinity
        !Number.isFinite(value)
      ) {
        return ValueType.UNKNOWN;
      }

      return ValueType.NUMBER;
    default:
      return ValueType.OBJECT;
  }
}

/**
 * @function isReferenceType
 * @description 判断给定类型是否为引用类型（数组或对象）
 * @param {ValueType} type 要判断的类型
 * @returns {boolean} 是否为引用类型
 */
export function isReferenceType(type: ValueType): type is ReferenceType {
  return type === ValueType.ARRAY || type === ValueType.OBJECT;
}

/**
 * @function isSerializableType
 * @description 判断给定类型是否为 JSON 可序列化类型
 * @param {ValueType} type 要判断的类型
 * @returns {boolean} 是否为可序列化类型
 */
export function isSerializableType(type: ValueType): type is Exclude<ValueType, ValueType.UNKNOWN> {
  return type !== ValueType.UNKNOWN;
}

/**
 * @function isPrimitiveType
 * @description 判断给定类型是否为基本类型（非数组/对象）
 * @param {ValueType} type 要判断的类型
 * @returns {boolean} 是否为基本类型
 */
export function isPrimitiveType(type: ValueType): type is Exclude<ValueType, ReferenceType | ValueType.UNKNOWN> {
  return type !== ValueType.ARRAY && type !== ValueType.OBJECT && type !== ValueType.UNKNOWN;
}

/**
 * @function createStackFrame
 * @description 创建一个新的栈帧（数组或对象），使用迭代器进行深度优先遍历
 * @param {unknown[] | object} source 源数据
 * @param {ReferenceType} sourceType 源数据类型
 * @param {number} depth 源数据层级
 * @returns {StackFrame} 新创建的栈帧
 */
export function createStackFrame(source: unknown[] | object, sourceType: ReferenceType, depth: number): StackFrame {
  return {
    depth,
    source,
    rendered: 0,
    opened: false,
    type: sourceType,
    entries:
      sourceType === ValueType.ARRAY
        ? // 数组迭代器
          (source as unknown[]).entries()
        : // 对象迭代器
          Object.entries(source as object).values()
  };
}
