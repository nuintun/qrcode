/**
 * @module ByteArrayOutputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

import OutputStream from './OutputStream';

export default class ByteArrayOutputStream extends OutputStream {
  private bytes: number[] = [];

  public writeByte(byte: number): void {
    this.bytes.push(byte);
  }

  public flush(): void {
    // do nothing
  }

  public toByteArray(): number[] {
    return this.bytes;
  }
}
