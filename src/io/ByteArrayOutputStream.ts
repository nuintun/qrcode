/**
 * @module ByteArrayOutputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { OutputStream } from './OutputStream';

export class ByteArrayOutputStream extends OutputStream {
  private bytes: number[] = [];

  public writeByte(byte: number): void {
    this.bytes.push(byte);
  }

  public writeInt16(byte: number): void {
    this.bytes.push(byte, byte >>> 8);
  }

  public toByteArray(): number[] {
    return this.bytes;
  }
}
