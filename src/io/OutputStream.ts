/**
 * @module OutputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

export abstract class OutputStream {
  public abstract writeByte(byte: number): void;

  public writeBytes(bytes: number[], offset: number = 0, length: number = bytes.length): void {
    for (let i = 0; i < length; i++) {
      this.writeByte(bytes[i + offset]);
    }
  }

  public flush(): void {
    // The flush method
  }

  public close(): void {
    this.flush();
  }
}
