import { Encoder, Byte, Kanji } from '@nuintun/qrcode';

const encoder = new Encoder({
  hints: ['CHARACTER_SET']
});
const qrcode = encoder.encode(new Byte('你好世界\n'), new Byte('hello world\n'), new Kanji('こんにちは世界'));

console.log(qrcode.toDataURL());
