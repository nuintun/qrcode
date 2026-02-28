/**
 * @module index
 * @description JSON 查看器组件，支持语法高亮、循环引用检测和自定义主题
 */

import {
  createStackFrame,
  DEFAULT_THEME,
  getIndent,
  getValueType,
  indents,
  isPrimitiveType,
  isReferenceType,
  isSerializableType,
  LINE_FEED
} from './utils';
import React, { memo, useMemo } from 'react';
import { ColorTheme, JSONViewerProps, StackFrame, ValueType } from './types';
import { renderBracket, renderCircularValue, renderPrimitiveValue } from './render';

// 导出类型定义
export type { ColorTheme, JSONViewerProps };

/**
 * @function highlight
 * @description 将 JSON 数据转换为带语法高亮的 React 元素数组
 * @param {unknown} data 待处理的 JSON 数据
 * @param {ColorTheme} [theme] 颜色主题
 * @param {number} [indentSize] 缩进空格数
 * @returns {React.ReactNode | React.ReactNode[]} 渲染后的 React 节点或节点数组
 */
function highlight(data: unknown, theme?: ColorTheme, indentSize = 2): React.ReactNode | React.ReactNode[] {
  let valueType = getValueType(data);

  // 根节点为非可序列化类型 -> 不渲染
  if (!isSerializableType(valueType)) {
    return null;
  }

  // React Key 索引
  let keyIndex = 0;

  // 创建颜色主题对象
  const colors = { ...DEFAULT_THEME, ...theme };

  // 创建基本类型样式对象
  const valueStyles = {
    key: { color: colors.key },
    null: { color: colors.null },
    string: { color: colors.string },
    number: { color: colors.number },
    boolean: { color: colors.boolean },
    circular: { color: colors.circular }
  };

  // 根节点为基本类型 -> 直接渲染
  if (isPrimitiveType(valueType)) {
    // 渲染基本类型
    return renderPrimitiveValue(keyIndex++, data, valueType, valueStyles);
  }

  // 创建栈帧缓存
  const stack: StackFrame[] = [];
  // 创建结果数组
  const nodes: React.ReactNode[] = [];
  // 创建已访问对象缓存
  const visited = new WeakSet<object | unknown[]>();

  // 添加遍历缓存
  visited.add(data as object | unknown[]);

  // 创建括号样式对象
  const bracketStyle = { color: colors.bracket };
  // 创建标点样式对象
  const punctuationStyle = { color: colors.punctuation };

  // 创建根节点栈帧
  let current: StackFrame | undefined = createStackFrame(data as object | unknown[], valueType, 0);

  // 循环处理栈帧
  while (current != null) {
    // 处理左括号（首次进入该帧）
    if (!current.opened) {
      // 切换打开状态
      current.opened = true;

      // 渲染左括号
      nodes.push(renderBracket(keyIndex++, true, current.type, bracketStyle));
      continue;
    }

    // 获取迭代器的下一个迭代结果
    const entry = current.entries.next();

    // 处理帧内的元素
    if (!entry.done) {
      let [key, value] = entry.value;

      // 获取当前值的类型
      valueType = getValueType(value);

      // 父节点是否为对象
      const isObject = current.type === ValueType.OBJECT;

      // 非可序列化类型处理
      if (!isSerializableType(valueType)) {
        // 父节点为对象 -> 跳过
        if (isObject) {
          continue;
        }

        // 父节点为数组则转为 null
        value = null;
        valueType = ValueType.NULL;
      }

      // 渲染逗号和换行
      if (current.rendered > 0) {
        nodes.push(
          <span key={keyIndex++} style={punctuationStyle}>
            ,
          </span>,
          LINE_FEED
        );
      } else {
        nodes.push(LINE_FEED);
      }

      // 计算当前节点深度
      const depth = current.depth + 1;

      // 渲染缩进
      nodes.push(getIndent(indentSize, depth));

      // 渲染对象属性名
      if (isObject) {
        // 对象属性名和冒号
        nodes.push(
          <span key={keyIndex++} style={valueStyles.key}>
            {JSON.stringify(key)}
          </span>,
          <span key={keyIndex++} style={punctuationStyle}>
            :
          </span>,
          ' '
        );
      }

      if (isPrimitiveType(valueType)) {
        // 渲染次数递增
        current.rendered++;

        // 渲染基本类型值
        nodes.push(renderPrimitiveValue(keyIndex++, value, valueType, valueStyles));
      } else if (visited.has(value as object | unknown[])) {
        // 渲染次数递增
        current.rendered++;

        // 渲染循环引用
        nodes.push(renderCircularValue(keyIndex++, valueStyles));
      } else if (isReferenceType(valueType)) {
        // 渲染次数递增
        current.rendered++;

        // 缓存当前栈帧
        stack.push(current);

        // 添加遍历缓存
        visited.add(value as object | unknown[]);

        // 创建新的栈帧
        current = createStackFrame(value as object | unknown[], valueType, depth);
      }
      continue;
    }

    // 非空引用值多渲染一次换行和缩进
    if (current.rendered > 0) {
      nodes.push(LINE_FEED, getIndent(indentSize, current.depth));
    }

    // 渲染右括号
    nodes.push(renderBracket(keyIndex++, false, current.type, bracketStyle));

    // 删除已访问对象
    visited.delete(current.source);

    // 获取新栈帧
    current = stack.pop();
  }

  // 清空缩进缓存
  indents.clear();

  // 返回结果
  return nodes;
}

/**
 * @component JSONViewer
 * @description JSON 查看器主组件，提供语法高亮显示功能
 * @param {JSONViewerProps} props 组件属性
 * @returns {React.ReactElement} 渲染后的组件
 */
export default memo(function JSONViewer({ data, style, theme, className, indentSize }: JSONViewerProps): React.ReactElement {
  const nodes = useMemo(() => {
    return highlight(data, theme, indentSize);
  }, [data, theme, indentSize]);

  return (
    <pre style={style} className={className}>
      <code style={{ font: 'inherit' }}>{nodes}</code>
    </pre>
  );
});
