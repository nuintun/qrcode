/**
 * @module OutputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

export abstract class OutputStream {
  public abstract writeByte(byte: number): void;

  public writeBytes(bytes: number[]): void {
    for (const byte of bytes) {
      this.writeByte(byte);
    }
  }

  public flush(): void {
    // The flush method
  }

  public close(): void {
    this.flush();
  }
}
