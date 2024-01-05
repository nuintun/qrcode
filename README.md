# QRCode

<!-- prettier-ignore -->
> A pure JavaScript QRCode encode and decode library.
>
> [![NPM Version][npm-image]][npm-url]
> [![Download Status][download-image]][npm-url]
> [![Languages Status][languages-image]][github-url]
> [![Tree Shakeable][tree-shakeable-image]][bundle-phobia-url]
> [![Side Effect][side-effect-image]][bundle-phobia-url]
> [![License][license-image]][license-url]

### QRCode guide and demo

<!-- prettier-ignore -->
> [QRCode guide](https://nuintun.github.io/qrcode/packages/core/spec/ISO-IEC-18004-2015.pdf)
>
> [QRCode encode example](https://nuintun.github.io/qrcode/packages/examples/static/index.html#/encode)
>
> [QRCode decode example](https://nuintun.github.io/qrcode/packages/examples/static/index.html#/decode)

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

declare interface DataURLOptions {
  margin?: number;
  foreground?: RGB;
  background?: RGB;
}

declare class Encoded {
  public size: number;
  public mask: number;
  public level: Level;
  public version: number;
  public get(x: number, y: number): number;
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
  version?: 'Auto' | number;
  encode?: (content: string, charset: Charset) => Uint8Array;
}

declare class Encoder {
  public constructor(options?: Options);
  public encode(...segments: (Alphanumeric | Byte | Hanzi | Kanji | Numeric)[]): Encoded;
}
```

#### Decoder

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
  const detected = detector.detect(binarized);
  const decoder = new Decoder();

  let iterator = detected.next();

  while (!iterator.done) {
    let succeed = false;

    const detect = iterator.value;

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
      // 解码失败，跳过
    }

    iterator = detected.next(succeed);
  }
});

image.src = 'https://nuintun.github.io/qrcode/packages/examples/src/images/qrcode.jpg';
```

#### Interface

```ts
// ...
```

[npm-image]: https://img.shields.io/npm/v/@nuintun/qrcode?style=flat-square
[npm-url]: https://www.npmjs.org/package/@nuintun/qrcode
[download-image]: https://img.shields.io/npm/dm/@nuintun/qrcode?style=flat-square
[languages-image]: https://img.shields.io/github/languages/top/nuintun/qrcode?style=flat-square
[github-url]: https://github.com/nuintun/qrcode
[tree-shakeable-image]: https://img.shields.io/badge/tree--shakeable-true-brightgreen?style=flat-square
[side-effect-image]: https://img.shields.io/badge/side--effect-free-brightgreen?style=flat-square
[bundle-phobia-url]: https://bundlephobia.com/result?p=@nuintun/qrcode
[license-image]: https://img.shields.io/github/license/nuintun/qrcode?style=flat-square
[license-url]: https://github.com/nuintun/qrcode/blob/master/LICENSE
