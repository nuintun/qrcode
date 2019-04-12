/**
 * @module Base64
 * @author nuintun
 * @author Kazuhiko Arase
 */

import ByteArrayInputStream from './ByteArrayInputStream';
import ByteArrayOutputStream from './ByteArrayOutputStream';
import Base64DecodeInputStream from './Base64DecodeInputStream';
import Base64EncodeOutputStream from './Base64EncodeOutputStream';

export function encode(data: number[]): number[] {
  const output: ByteArrayOutputStream = new ByteArrayOutputStream();

  try {
    const stream: Base64EncodeOutputStream = new Base64EncodeOutputStream(output);

    try {
      stream.writeBytes(data);
    } finally {
      stream.close();
    }
  } finally {
    output.close();
  }

  return output.toByteArray();
}

export function decode(data: number[]): number[] {
  const output: ByteArrayOutputStream = new ByteArrayOutputStream();

  try {
    const input: ByteArrayInputStream = new ByteArrayInputStream(data);
    const stream: Base64DecodeInputStream = new Base64DecodeInputStream(input);

    try {
      let byte: number;

      while ((byte = stream.readByte()) !== -1) {
        output.writeByte(byte);
      }
    } finally {
      stream.close();
    }
  } finally {
    output.close();
  }

  return output.toByteArray();
}
