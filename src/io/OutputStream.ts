/**
 * @module OutputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

export default abstract class OutputStream {
  public abstract writeByte(byte: number): void;

  public writeBytes(bytes: number[]): void {
    const length = bytes.length;

    for (let i: number = 0; i < length; i++) {
      this.writeByte(bytes[i]);
    }
  }

  public flush(): void {
    // flush
  }

  public close(): void {
    this.flush();
  }
}
