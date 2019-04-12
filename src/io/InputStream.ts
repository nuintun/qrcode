/**
 * @module InputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

export default abstract class InputStream {
  public abstract readByte(): number;
  public abstract close(): void;
}
