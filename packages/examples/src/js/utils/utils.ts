/**
 * @module utils
 */

/**
 * @function isFunction
 * @description 是否为函数
 * @param value 需要验证的值
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * @function createMarkup
 * @description 生成 React HTML 字符串
 * @param html HTML 字符串
 */
export function createMarkup(html: string): { __html: string } {
  return { __html: html };
}

/**
 * @interface ClassNamesHighlight
 * @description 高亮类名配置
 */
export interface ClassNamesHighlight {
  key?: string;
  null?: string;
  number?: string;
  string?: string;
  boolean?: string;
}

/**
 * @function syntaxHighlight
 * @description JSON 语法高亮
 * @param json JSON 字符串
 * @param classNames 高亮类名配置
 */
export function syntaxHighlight(
  json: string,
  {
    key: keyClassName = 'key',
    null: nullClassName = 'null',
    number: numberClassName = 'number',
    string: stringClassName = 'string',
    boolean: booleanClassName = 'boolean'
  }: ClassNamesHighlight = {}
): string {
  const PARSE_RE = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  return json
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(PARSE_RE, match => {
      let className = numberClassName;

      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          className = keyClassName;
        } else {
          className = stringClassName;
        }
      } else if (/null/.test(match)) {
        className = nullClassName;
      } else if (/true|false/.test(match)) {
        className = booleanClassName;
      }

      return `<span class="${className}">${match}</span>`;
    });
}
