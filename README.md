# QRCode

<!-- prettier-ignore -->
> A pure JavaScript QRCode encode and decode library.
>
> [![NPM Version][npm-image]][npm-url]
> [![Download Status][download-image]][npm-url]
> [![Languages Status][languages-image]][github-url]
> [![Zread][zread-image]][zread-url]
>
> [![Tree Shakeable][tree-shakeable-image]][bundle-phobia-url]
> [![Side Effect][side-effect-image]][bundle-phobia-url]
> [![Minzip][bundle-phobia-minzip]][bundle-phobia-url]
> [![License][license-image]][license-url]

### QRCode guide and example

<!-- prettier-ignore -->
> [QRCode guide](https://nuintun.github.io/qrcode/spec/ISO-IEC-18004-2015.pdf)
>
> [QRCode encode example](https://nuintun.github.io/qrcode/#/encode)
>
> [QRCode decode example](https://nuintun.github.io/qrcode/#/decode)

### Usage

##### Common Interface

```ts
declare type Level = 'L' | 'M' | 'Q' | 'H';

export class Charset {
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
  public static readonly SHIFT_JIS: Charset;
  public static readonly CP1250: Charset;
  public static readonly CP1251: Charset;
  public static readonly CP1252: Charset;
  public static readonly CP1256: Charset;
  public static readonly UTF_16BE: Charset;
  public static readonly UTF_8: Charset;
  public static readonly ASCII: Charset;
  public static readonly BIG5: Charset;
  public static readonly GB2312: Charset;
  public static readonly EUC_KR: Charset;
  public static readonly GBK: Charset;
  public static readonly GB18030: Charset;
  public static readonly UTF_16LE: Charset;
  public static readonly UTF_32BE: Charset;
  public static readonly UTF_32LE: Charset;
  public static readonly ISO_646_INV: Charset;
  public static readonly BINARY: Charset;
  public constructor(label: string, ...values: number[]);
}

declare type FNC1 = [mode: 'GS1'] | [mode: 'AIM', indicator: number];
```

##### Encoder Interface

```ts
export class Alphanumeric {
  public constructor(content: string);
}

export class Byte {
  public constructor(content: string, charset?: Charset);
}

export class Hanzi {
  public constructor(content: string);
}

export class Kanji {
  public constructor(content: string);
}

export class Numeric {
  public constructor(content: string);
}

export interface EncoderOptions {
  level?: Level;
  hints?: { fnc1?: FNC1 };
  version?: 'Auto' | number;
  encode?: (content: string, charset: Charset) => Uint8Array;
}

declare interface DataURLOptions {
  margin?: number;
  foreground?: [R: number, G: number, B: number];
  background?: [R: number, G: number, B: number];
}

export class Encoded {
  public size: number;
  public mask: number;
  public level: Level;
  public version: number;
  public get(x: number, y: number): 0 | 1;
  public toDataURL(moduleSize: number, options?: DataURLOptions): string;
}

export class Encoder {
  public constructor(options?: EncoderOptions);
  public encode(...segments: (Alphanumeric | Byte | Hanzi | Kanji | Numeric)[]): Encoded;
}
```

##### Encoder Example

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

##### Decoder Interface

```ts
export class BitMatrix {
  public constructor(width: number, height: number, bits?: Int32Array);
  public get width(): number;
  public get height(): number;
  public set(x: number, y: number): void;
  public get(x: number, y: number): 0 | 1;
  public flip(): void;
  public flip(x: number, y: number): void;
  public clone(): BitMatrix;
  public setRegion(left: number, top: number, width: number, height: number): void;
}

export class Point {
  public get x(): number;
  public get y(): number;
}

export class Pattern extends Point {
  public get moduleSize(): number;
}

declare class FinderPatternGroup {
  public get topLeft(): Pattern;
  public get topRight(): Pattern;
  public get bottomLeft(): Pattern;
}

export class Detected {
  public get matrix(): BitMatrix;
  public get finder(): FinderPatternGroup;
  public get alignment(): Pattern | undefined;
  public get size(): number;
  public get moduleSize(): number;
  public mapping(x: number, y: number): Point;
}

declare interface Structured {
  readonly index: number;
  readonly count: number;
  readonly parity: number;
}

export class Decoded {
  public get mask(): number;
  public get level(): Level;
  public get version(): number;
  public get mirror(): boolean;
  public get content(): string;
  public get corrected(): number;
  public get symbology(): string;
  public get fnc1(): FNC1 | false;
  public get codewords(): Uint8Array;
  public get structured(): Structured | false;
}

export function grayscale(imageData: ImageData): Uint8Array;

export function binarize(luminances: Uint8Array, width: number, height: number): BitMatrix;

export interface DetectorOptions {
  strict?: boolean;
}

export class Detector {
  public constructor(options?: DetectorOptions);
  public detect(binarized: BitMatrix): Generator<Detected, void, boolean>;
}

export interface DecoderOptions {
  decode?: (bytes: Uint8Array, charset: Charset) => string;
}

export class Decoder {
  public constructor(options?: DecoderOptions);
  public decode(matrix: BitMatrix): Decoded;
}
```

##### Decoder Example

```ts
import { binarize, Decoder, Detector, grayscale } from '@nuintun/qrcode';

const image = new Image();

image.crossOrigin = 'anonymous';

image.addEventListener('error', () => {
  console.error('image load error');
});

image.addEventListener('load', () => {
  const { width, height } = image;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  const luminances = grayscale(context.getImageData(0, 0, width, height));
  const binarized = binarize(luminances, width, height);
  const detector = new Detector();
  // Notice: the detect result are possible combinations of QR Code regions,
  // which may not necessarily be successfully decoded.
  const detected = detector.detect(binarized);
  const decoder = new Decoder();

  let current = detected.next();

  while (!current.done) {
    let succeed = false;

    const detect = current.value;

    try {
      const { size, finder, alignment } = detect;
      const decoded = decoder.decode(detect.matrix);
      // Finder
      const { topLeft, topRight, bottomLeft } = finder;
      // Corners
      const topLeftCorner = detect.mapping(0, 0);
      const topRightCorner = detect.mapping(size, 0);
      const bottomRightCorner = detect.mapping(size, size);
      const bottomLeftCorner = detect.mapping(0, size);
      // Timing
      const topLeftTiming = detect.mapping(6.5, 6.5);
      const topRightTiming = detect.mapping(size - 6.5, 6.5);
      const bottomLeftTiming = detect.mapping(6.5, size - 6.5);

      console.log({
        content: decoded.content,
        finder: [topLeft, topRight, bottomLeft],
        alignment: alignment ? alignment : null,
        timing: [topLeftTiming, topRightTiming, bottomLeftTiming],
        corners: [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner]
      });

      succeed = true;
    } catch {
      // Decode failed, skipping...
    }

    // Notice: pass succeed to next() is very important,
    // this can significantly reduce the number of detections.
    current = detected.next(succeed);
  }
});

image.src = 'https://nuintun.github.io/qrcode/public/images/qrcode.jpg';
```

### Links

<!-- prettier-ignore -->
> [zxing/zxing](https://github.com/zxing/zxing)
>
> [zxing-cpp/zxing-cpp](https://github.com/zxing-cpp/zxing-cpp)

[npm-image]: https://img.shields.io/npm/v/@nuintun/qrcode?style=flat-square
[npm-url]: https://www.npmjs.org/package/@nuintun/qrcode
[download-image]: https://img.shields.io/npm/dm/@nuintun/qrcode?style=flat-square
[languages-image]: https://img.shields.io/github/languages/top/nuintun/qrcode?style=flat-square
[github-url]: https://github.com/nuintun/qrcode
[zread-image]: https://img.shields.io/badge/Ask_Zread-_.svg?style=flat-square&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff
[zread-url]: https://zread.ai/nuintun/qrcode
[tree-shakeable-image]: https://img.shields.io/badge/tree--shakeable-true-brightgreen?style=flat-square
[side-effect-image]: https://img.shields.io/badge/side--effect-free-brightgreen?style=flat-square
[bundle-phobia-url]: https://bundlephobia.com/result?p=@nuintun/qrcode
[bundle-phobia-minzip]: https://img.shields.io/bundlephobia/minzip/%40nuintun/qrcode/latest?style=flat-square
[license-image]: https://img.shields.io/github/license/nuintun/qrcode?style=flat-square
[license-url]: https://github.com/nuintun/qrcode/blob/main/packages/core/LICENSE
