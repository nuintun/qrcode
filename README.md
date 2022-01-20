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
> [QRCode example use worker](https://nuintun.github.io/qrcode/examples/worker.html)
>
> Modify from [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) and [cozmo/jsQR](https://github.com/cozmo/jsQR)

### Usage

#### Encoder

```js
import { Encoder, QRByte, QRKanji, ErrorCorrectionLevel } from '@nuintun/qrcode';

const qrcode = new Encoder();

qrcode.setEncodingHint(true);
qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.H);

qrcode.write('你好世界\n');
qrcode.write(new QRByte('hello world\n'));
qrcode.write(new QRKanji('こんにちは世界'));

qrcode.make();

console.log(qrcode.toDataURL());
```

###### Constructor

- new Encoder(options?: Options): Encoder

  - version?: number;
  - encodingHint?: boolean;
  - errorCorrectionLevel?: ErrorCorrectionLevel;

###### Methods

- getMatrix(): boolean[][]

  - Get qrcode modules matrix.

- getMatrixSize(): number

  - Get qrcode modules matrix size.

- setVersion(version: number): Encoder

  - Set qrcode version, if set `0` the version will be set automatically.

- getVersion(): number

  - Get qrcode version.

- setErrorCorrectionLevel(errorCorrectionLevel: ErrorCorrectionLevel): Encoder

  - Set qrcode error correction level.

- getErrorCorrectionLevel(): ErrorCorrectionLevel

  - Get qrcode error correction level.

- setEncodingHint(encodingHint: boolean): Encoder

  - Set qrcode encoding hint, it will add ECI in qrcode.

- getEncodingHint(): boolean

  - Get qrcode encoding hint.

- write(data: string \| QRByte \| QRKanji \| QRNumeric \| QRAlphanumeric): Encoder

  - Add qrcode data, if string will use `QRByte` by default.

- isDark(row: number, col: number): boolean

  - Get byte with row and col.

- make(): Encoder

  - Make qrcode matrix.

- toDataURL(moduleSize?: number, margin?: number): string

  - Output qrcode base64 gif image.

- clear(): void
  - Clear written data.

###### Custom ECI

```js
import { Encoder, QRByte } from '@nuintun/qrcode';

const qrcode = new Encoder();

qrcode.setEncodingHint(true);

// Custom your own encode function return bytes and encoding
// The encoding value must a valid ECI value
// Custom ECI only support QRByte mode
// https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/CharacterSetECI.java
qrcode.write(
  new QRByte('hello world', data => ({
    encoding: 26,
    bytes: [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]
  }))
);

qrcode.make();

console.log(qrcode.toDataURL());
```

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
