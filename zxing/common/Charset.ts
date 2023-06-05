/**
 * @module Charset
 */

const NAME_TO_CHARSET = new Map<string, Charset>();
const VALUES_TO_CHARSET = new Map<number, Charset>();

export class Charset {
  #label: string;
  #values: number[];

  public static readonly CP437 = new Charset('cp437', 0, 2);
  public static readonly ISO_8859_1 = new Charset('iso-8859-1', 1, 3);
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
  public static readonly SJIS = new Charset('sjis', 20);
  public static readonly CP1250 = new Charset('cp1250', 21);
  public static readonly CP1251 = new Charset('cp1251', 22);
  public static readonly CP1252 = new Charset('cp1252', 23);
  public static readonly CP1256 = new Charset('cp1256', 24);
  public static readonly UTF_16BE = new Charset('utf-16be', 25);
  public static readonly UTF_8 = new Charset('utf-8', 26);
  public static readonly ASCII = new Charset('ascii', 27, 170);
  public static readonly Big5 = new Charset('big5', 28);
  public static readonly GB18030 = new Charset('gb18030', 29);
  public static readonly EUC_KR = new Charset('euc-kr', 30);

  private constructor(label: string, ...values: number[]) {
    NAME_TO_CHARSET.set(label, this);

    for (const value of values) {
      VALUES_TO_CHARSET.set(value, this);
    }

    this.#label = label;
    this.#values = values;
  }

  public get label(): string {
    return this.#label;
  }

  public get values(): number[] {
    return this.#values;
  }
}

export function getCharSetByValue(value: number): Charset {
  const charset = VALUES_TO_CHARSET.get(value);

  if (charset) {
    return charset;
  }

  throw Error('illegal charset value');
}

export function getCharSetByName(name: string): Charset {
  const charset = NAME_TO_CHARSET.get(name);

  if (charset) {
    return charset;
  }

  throw Error('illegal charset name');
}
