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
