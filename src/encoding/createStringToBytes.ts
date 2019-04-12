/**
 * @module createStringToBytes
 * @author nuintun
 * @author Kazuhiko Arase
 */

import * as ASCII from '../io/ASCII';
import ByteArrayInputStream from '../io/ByteArrayInputStream';
import Base64DecodeInputStream from '../io/Base64DecodeInputStream';

type unicodeMap = { [ch: string]: number };

const toString = Object.prototype.toString;

function toBytes(str: string): number[] {
  const bytes: number[] = [];
  const length: number = str.length;

  for (let i: number = 0; i < length; i++) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

function readByte(input: Base64DecodeInputStream): number {
  const byte = input.readByte();

  if (byte === -1) throw 'eof';

  return byte;
}

function createUnicodeMap(unicodeData: string, numChars: number): unicodeMap {
  const unicodeMap: unicodeMap = {};
  const input: Base64DecodeInputStream = new Base64DecodeInputStream(new ByteArrayInputStream(toBytes(unicodeData)));

  let count: number = 0;

  while (true) {
    const b0: number = input.readByte();

    if (b0 === -1) break;

    const b1: number = readByte(input);
    const b2: number = readByte(input);
    const b3: number = readByte(input);
    const k: string = String.fromCharCode((b0 << 8) | b1);
    const v: number = (b2 << 8) | b3;

    unicodeMap[k] = v;
    count += 1;
  }

  if (count !== numChars) {
    throw `${count} != ${numChars}`;
  }

  return unicodeMap;
}

/**
 * @function createStringToBytes
 * @param unicodeData base64 string of byte array. [16bit Unicode],[16bit Bytes], ...
 * @param numChars
 */
export default function createStringToBytes(unicodeData: string, numChars: number): (str: string) => number[] {
  // create conversion map.
  const unicodeMap: unicodeMap = createUnicodeMap(unicodeData, numChars);

  return function(str: string): number[] {
    const bytes: number[] = [];
    const length: number = str.length;

    for (let i: number = 0; i < length; i++) {
      const c: number = str.charCodeAt(i);

      if (c < 128) {
        bytes.push(c);
      } else {
        const b: number = unicodeMap[str.charAt(i)];

        if (toString.call(b) === '[object Number]') {
          if ((b & 0xff) === b) {
            // 1byte
            bytes.push(b);
          } else {
            // 2bytes
            bytes.push(b >>> 8);
            bytes.push(b & 0xff);
          }
        } else {
          bytes.push(ASCII.QUES);
        }
      }
    }

    return bytes;
  };
}
