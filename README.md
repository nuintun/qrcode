# QRCode

<!-- prettier-ignore -->
> A pure JavaScript QRCode encode and decode library.
>
> [![NPM Version][npm-image]][npm-url]
> [![Download Status][download-image]][npm-url]
> [![Tree Shakeable][tree-shakeable-image]][bundle-phobia-url]
> [![Side Effect][side-effect-image]][bundle-phobia-url]
> [![Snyk Vulnerabilities][snyk-image]][snyk-url]
> [![License][license-image]][license-url]

### QRCode guide and demo

<!-- prettier-ignore -->
> [QRCode guide](https://nuintun.github.io/qrcode/spec/ISO-IEC-18004-2015.pdf)
>
> [QRCode example](https://nuintun.github.io/qrcode/examples/index.html)
>
> Modify from [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) and [cozmo/jsQR](https://github.com/cozmo/jsQR)

### Usage

#### Encoder

```ts
import { Byte, Encoder, Hanzi, Kanji } from '@nuintun/qrcode';

const encoder = new Encoder({
  level: 'H'
});

const qrcode = encoder.encode(
  // Hanzi
  new Hanzi('你好世界'),
  // Byte
  new Byte('\nhello world\n'),
  // Kanji
  new Kanji('こんにちは世界')
);

console.log(qrcode.toDataURL());
```

#### Interface

```ts
declare type Level = 'L' | 'M' | 'Q' | 'H';

declare type RGB = [R: number, G: number, B: number];

declare type FNC1 = [mode: 'GS1'] | [mode: 'AIM', indicator: number];

declare class Charset {
  public static readonly CP437: Charset;
  public static readonly ISO_8859_1: Charset;
  public static readonly ISO_8859_2: Charset;
  public static readonly ISO_8859_3: Charset;
  public static readonly ISO_8859_4: Charset;
  public static readonly ISO_8859_5: Charset;
  public static readonly ISO_8859_6: Charset;
  public static readonly ISO_8859_7: Charset;
  public static readonly ISO_8859_8: Charset;
  public static readonly ISO_8859_9: Charset;
  public static readonly ISO_8859_10: Charset;
  public static readonly ISO_8859_11: Charset;
  public static readonly ISO_8859_13: Charset;
  public static readonly ISO_8859_14: Charset;
  public static readonly ISO_8859_15: Charset;
  public static readonly ISO_8859_16: Charset;
  public static readonly SJIS: Charset;
  public static readonly CP1250: Charset;
  public static readonly CP1251: Charset;
  public static readonly CP1252: Charset;
  public static readonly CP1256: Charset;
  public static readonly UTF_16BE: Charset;
  public static readonly UTF_8: Charset;
  public static readonly ASCII: Charset;
  public static readonly BIG5: Charset;
  public static readonly GB18030: Charset;
  public static readonly EUC_KR: Charset;
  public constructor(label: string, ...values: number[]);
}

declare class Matrix {
  public size: number;
  public get(x: number, y: number): number;
}

declare interface DataURLOptions {
  margin?: number;
  foreground?: RGB;
  background?: RGB;
}

declare class QRCode {
  public level: Level;
  public mask: number;
  public matrix: Matrix;
  public version: number;
  public toDataURL(moduleSize: number, options?: DataURLOptions): string;
}

declare class Alphanumeric {
  public constructor(content: string);
}

declare class Byte {
  public constructor(content: string, charset?: Charset);
}

declare class Hanzi {
  public constructor(content: string);
}

declare class Kanji {
  public constructor(content: string);
}

declare class Numeric {
  public constructor(content: string);
}

declare interface Options {
  level?: Level;
  hints?: { fnc1?: FNC1 };
  version?: number | 'auto';
  encode?: (content: string, charset: Charset) => Uint8Array;
}

declare class Encoder {
  public constructor(options?: Options);
  public encode(...segments: (Alphanumeric | Byte | Hanzi | Kanji | Numeric)[]): QRCode;
}
```

#### Decoder

```ts
import { Decoder } from '@nuintun/qrcode';

const qrcode = new Decoder();

qrcode
  .scan('https://nuintun.github.io/qrcode/examples/qrcode.jpg')
  .then(result => {
    console.log(result.data);
  })
  .catch(error => {
    console.error(error);
  });
```

###### Constructor

- new Decoder(options?: Options): Decoder

  - canOverwriteImage?: boolean
  - inversionAttempts?: 'dontInvert' \| 'onlyInvert' \| 'attemptBoth' \| 'invertFirst'
  - greyScaleWeights?: { red: number, green: number, blue: number, useIntegerApproximation?: boolean }

###### Methods

- setOptions(options: Options): Decoder

  - Set decode options.
    - canOverwriteImage?: boolean
    - inversionAttempts?: 'dontInvert' \| 'onlyInvert' \| 'attemptBoth' \| 'invertFirst'
    - greyScaleWeights?: { red: number, green: number, blue: number, useIntegerApproximation?: boolean }

- scan(src: string): Promise\<DecoderResult>

  - Decode a qrcode from image src.
  - `Notice: support browser environment only.`

- decode(data: Uint8ClampedArray, width: number, height: number): DecoderResult

  - Decode a qrcode from image data.

[npm-image]: https://img.shields.io/npm/v/@nuintun/qrcode?style=flat-square
[npm-url]: https://www.npmjs.org/package/@nuintun/qrcode
[download-image]: https://img.shields.io/npm/dm/@nuintun/qrcode?style=flat-square
[tree-shakeable-image]: https://img.shields.io/badge/tree--shakeable-true-brightgreen?style=flat-square
[side-effect-image]: https://img.shields.io/badge/side--effect-free-brightgreen?style=flat-square
[bundle-phobia-url]: https://bundlephobia.com/result?p=@nuintun/qrcode
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/nuintun/qrcode?style=flat-square
[snyk-url]: https://snyk.io/test/github/nuintun/qrcode
[license-image]: https://img.shields.io/github/license/nuintun/qrcode?style=flat-square
[license-url]: https://github.com/nuintun/qrcode/blob/master/LICENSE
