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
> [QRCode guide](https://nuintun.github.io/qrcode/qrcode.pdf)
>
> [QRCode example](https://nuintun.github.io/qrcode/examples/index.html)
>
> Modify from [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) and [cozmo/jsQR](https://github.com/cozmo/jsQR)

### Usage

#### Encoder

```js
import { Byte, Encoder, Kanji } from '@nuintun/qrcode';

const encoder = new Encoder({
  level: 'H',
  hints: {
    eci: true,
    gs1: false
  }
});

const qrcode = encoder.encode(
  // Byte
  new Byte('你好世界\n'),
  // Byte
  new Byte('hello world\n'),
  // Kanji
  new Kanji('こんにちは世界')
);

console.log(qrcode.toDataURL());
```

###### Constructor

- new Encoder(options?: Options): Encoder
  - version?: number | 'auto';
  - level?: 'L' | 'M' | 'Q' | 'H';
  - hints?: { eci?: boolean, gs1?: boolean };
  - encode ?: (content: string, charset: Charset) => Uint8Array;

###### Methods

- encode(...segment: (Byte | Kanji | Numeric | Alphanumeric)[]): QRCode
  - Encode segments to qrcode.
    - QRCode
      - mask
      - level
      - matrix
      - version
      - toDataURL

#### Decoder

```js
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
