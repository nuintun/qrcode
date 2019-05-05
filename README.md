# QRCode

> QRCode encode and decode library.
>
> [![NPM Version][npm-image]][npm-url]
> [![Download Status][download-image]][npm-url]
> [![Dependencies][david-image]][david-url]

### QRCode guide and demo

> [QRCode guide](http://coolshell.cn/articles/10590.html)
>
> [QRCode demo](https://nuintun.github.io/qrcode/example/index.html)
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

###### Methods

- getModules(): boolean[][]

  - Get qrcode modules matrix.

- getModuleCount(): number

  - Get qrcode module count.

- setVersion(version: number): void

  - Set qrcode version, if set `-1` the version will be set automatically.

- getVersion(): number

  - Get qrcode version.

- setErrorCorrectionLevel(errorCorrectionLevel: ErrorCorrectionLevel): void

  - Set qrcode error correction level.

- getErrorCorrectionLevel(): ErrorCorrectionLevel

  - Get qrcode error correction level.

- setEncodingHint(hasEncodingHint: boolean): void

  - Set qrcode encoding hint, it will add ECI in qrcode.

- getEncodingHint(): boolean

  - Get qrcode encoding hint.

- write(data: string : QRByte | QRKanji | QRNumeric | QRAlphanumeric): void

  - Add qrcode data, if string will use `QRByte` by default.

- isDark(row: number, col: number): boolean

  - Get byte with row and col.

- make(): void

  - Make qrcode matrix.

- toDataURL(moduleSize: number, margin: number): string

  - Output qrcode base64 gif image.

###### Custom ECI

```js
import { Encoder, QRByte } from '@nuintun/qrcode';

const qrcode = new Encoder();

qrcode.setEncodingHint(true);

// Custom your own encode and return bytes and encoding
// The encoding value must a valid ECI value
// https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/CharacterSetECI.java
qrcode.write(new QRByte('hello world', data => ({
  encoding: 26,
  bytes: [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]
})));

qrcode.make();

console.log(qrcode.toDataURL());
```

#### Decoder

```js
import { Decoder } from '@nuintun/qrcode';

const qrcode = new Decoder();

qrcode
  .scan('https://nuintun.github.io/qrcode/example/qrcode.jpg')
  .then(result => {
    console.log(result.data);
  })
  .catch(error => {
    console.error(result.data);
  });
```

###### Methods

- setOptions(options: { inversionAttempts: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst' }): void

  - Set decode options.

- scan(src: string): Promise<DecoderResult>

  - Decode a qrcode from image src.

- decode(data: Uint8ClampedArray, width: number, height: number): DecoderResult

  - Decode a qrcode from image data.

[npm-image]: https://img.shields.io/npm/v/@nuintun/qrcode.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/@nuintun/qrcode
[download-image]: https://img.shields.io/npm/dm/@nuintun/qrcode.svg?style=flat-square
[david-image]: https://img.shields.io/david/nuintun/qrcode.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/qrcode
