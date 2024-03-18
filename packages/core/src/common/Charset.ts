/**
 * @module Charset
 */

const VALUES_TO_CHARSET = new Map<number, Charset>();

export function fromCharsetValue(value: number): Charset {
  const charset = VALUES_TO_CHARSET.get(value);

  if (charset) {
    return charset;
  }

  throw Error('illegal charset value');
}

export class Charset {
  #label: string;
  #values: readonly number[];

  // See: https://en.wikipedia.org/wiki/Extended_Channel_Interpretation
  public static readonly CP437 = new Charset('cp437', 2, 0);
  public static readonly ISO_8859_1 = new Charset('iso-8859-1', 3, 1);
  public static readonly ISO_8859_2 = new Charset('iso-8859-2', 4);
  public static readonly ISO_8859_3 = new Charset('iso-8859-3', 5);
  public static readonly ISO_8859_4 = new Charset('iso-8859-4', 6);
  public static readonly ISO_8859_5 = new Charset('iso-8859-5', 7);
  public static readonly ISO_8859_6 = new Charset('iso-8859-6', 8);
  public static readonly ISO_8859_7 = new Charset('iso-8859-7', 9);
  public static readonly ISO_8859_8 = new Charset('iso-8859-8', 10);
  public static readonly ISO_8859_9 = new Charset('iso-8859-9', 11);
  public static readonly ISO_8859_10 = new Charset('iso-8859-10', 12);
  public static readonly ISO_8859_11 = new Charset('iso-8859-11', 13);
  public static readonly ISO_8859_13 = new Charset('iso-8859-13', 15);
  public static readonly ISO_8859_14 = new Charset('iso-8859-14', 16);
  public static readonly ISO_8859_15 = new Charset('iso-8859-15', 17);
  public static readonly ISO_8859_16 = new Charset('iso-8859-16', 18);
  public static readonly SHIFT_JIS = new Charset('shift-jis', 20);
  public static readonly CP1250 = new Charset('cp1250', 21);
  public static readonly CP1251 = new Charset('cp1251', 22);
  public static readonly CP1252 = new Charset('cp1252', 23);
  public static readonly CP1256 = new Charset('cp1256', 24);
  public static readonly UTF_16BE = new Charset('utf-16be', 25);
  public static readonly UTF_8 = new Charset('utf-8', 26);
  public static readonly ASCII = new Charset('ascii', 27);
  public static readonly BIG5 = new Charset('big5', 28);
  public static readonly GB2312 = new Charset('gb2312', 29);
  public static readonly EUC_KR = new Charset('euc-kr', 30);
  public static readonly GBK = new Charset('gbk', 31);
  public static readonly GB18030 = new Charset('gb18030', 32);
  public static readonly UTF_16LE = new Charset('utf-16le', 33);
  public static readonly UTF_32BE = new Charset('utf-32be', 34);
  public static readonly UTF_32LE = new Charset('utf-32le', 35);
  public static readonly ISO_646_INV = new Charset('iso-646-inv', 170);
  public static readonly BINARY = new Charset('binary', 899);

  /**
   * @constructor
   * @param label The label of charset.
   * @param values The values of charset.
   */
  constructor(label: string, ...values: number[]) {
    this.#label = label;
    this.#values = Object.freeze(values);

    for (const value of values) {
      if (value >= 0 && value <= 999999 && Number.isInteger(value)) {
        VALUES_TO_CHARSET.set(value, this);
      } else {
        throw new Error('illegal extended channel interpretation value');
      }
    }
  }

  /**
   * @property label
   * @description Get the label of charset.
   */
  public get label(): string {
    return this.#label;
  }

  /**
   * @property values
   * @description Get the values of charset.
   */
  public get values(): readonly number[] {
    return this.#values;
  }
}
