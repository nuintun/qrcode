/**
 * @module base64
 */

const BASE64_CODES = Array.from(
  // Base64 alphabet.
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  char => char.charCodeAt(0)
);

/**
 * Encodes bytes into a Base64 string.
 */
export function toBase64(bytes: Uint8Array): string {
  if (bytes.toBase64 != null) {
    return bytes.toBase64();
  }

  let offset = 0;
  let base64 = '';
  let byteOffset = 0;

  const chunkSize = 8192;
  const { fromCharCode } = String;
  const byteLength = bytes.length;
  const codes = new Array<number>(Math.ceil(byteLength / 3) * 4);

  while (byteOffset + 2 < byteLength) {
    const byte1 = bytes[byteOffset++];
    const byte2 = bytes[byteOffset++];
    const byte3 = bytes[byteOffset++];

    codes[offset++] = BASE64_CODES[byte1 >>> 2];
    codes[offset++] = BASE64_CODES[((byte1 & 0x03) << 4) | (byte2 >>> 4)];
    codes[offset++] = BASE64_CODES[((byte2 & 0x0f) << 2) | (byte3 >>> 6)];
    codes[offset++] = BASE64_CODES[byte3 & 0x3f];
  }

  if (byteOffset < byteLength) {
    const byte1 = bytes[byteOffset++];
    const hasByte2 = byteOffset < byteLength;
    const byte2 = hasByte2 ? bytes[byteOffset] : 0;

    codes[offset++] = BASE64_CODES[byte1 >>> 2];
    codes[offset++] = BASE64_CODES[((byte1 & 0x03) << 4) | (byte2 >>> 4)];
    codes[offset++] = hasByte2 ? BASE64_CODES[(byte2 & 0x0f) << 2] : 0x3d;
    codes[offset++] = 0x3d;
  }

  for (let i = 0; i < offset; i += chunkSize) {
    base64 += fromCharCode(...codes.slice(i, Math.min(i + chunkSize, offset)));
  }

  return base64;
}
