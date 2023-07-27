import { Alphanumeric, Byte, Charset, Encoder, Hanzi, Kanji, Numeric } from '@nuintun/qrcode';

export interface EncodeMessage {
  fnc1: string;
  mode: string;
  charset: string;
  content: string;
  quietZone: number;
  background: string;
  foreground: string;
  moduleSize: number;
  aimIndicator: number;
  version: 'auto' | number;
  level: 'L' | 'M' | 'Q' | 'H';
}

export interface EncodeResultMessage {
  data: string;
  type: 'ok' | 'error';
}

type CharsetNames = keyof typeof Charset;

function hex2rgb(hex: string): [R: number, G: number, B: number] {
  console.log(hex);
  const value = parseInt(hex.replace('#', '0x'));

  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function getFNC1Hint({ fnc1, aimIndicator }: EncodeMessage): ['GS1'] | ['AIM', number] | undefined {
  switch (fnc1) {
    case 'GS1':
      return ['GS1'];
    case 'AIM':
      return ['AIM', +aimIndicator];
  }
}

function chooseBestMode({ mode, content, charset }: EncodeMessage): Byte | Hanzi | Kanji | Numeric | Alphanumeric {
  switch (mode) {
    case 'Auto':
      const NUMERIC_RE = /^\d+$/;
      const ALPHANUMERIC_RE = /^[0-9A-Z$%*+-./: ]+$/;

      if (NUMERIC_RE.test(content)) {
        return new Numeric(content);
      } else if (ALPHANUMERIC_RE.test(content)) {
        return new Alphanumeric(content);
      }

      const hanzi = new Hanzi(content);

      try {
        hanzi.encode();

        return hanzi;
      } catch {
        // 跳过错误
      }

      const kanji = new Kanji(content);

      try {
        kanji.encode();

        return kanji;
      } catch {
        // 跳过错误
      }

      return new Byte(content, Charset[charset as CharsetNames]);
    case 'Hanzi':
      return new Hanzi(content);
    case 'Kanji':
      return new Kanji(content);
    case 'Numeric':
      return new Numeric(content);
    case 'Alphanumeric':
      return new Alphanumeric(content);
    default:
      return new Byte(content, Charset[charset as CharsetNames]);
  }
}

self.addEventListener('message', ({ data }: MessageEvent<EncodeMessage>) => {
  const { level, version } = data;

  const encoder = new Encoder({
    level,
    version,
    hints: {
      fnc1: getFNC1Hint(data)
    }
  });

  try {
    const qrcode = encoder.encode(chooseBestMode(data));
    const { moduleSize, quietZone, background, foreground } = data;
    const message: EncodeResultMessage = {
      type: 'ok',
      data: qrcode.toDataURL(moduleSize, {
        margin: quietZone,
        background: hex2rgb(background),
        foreground: hex2rgb(foreground)
      })
    };

    self.postMessage(message);
  } catch (error) {
    const message: EncodeResultMessage = {
      type: 'error',
      data: (error as Error).message
    };

    self.postMessage(message);
  }
});
