/**
 * @module Segment
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { Mode } from '../common/Mode';
import { BitBuffer } from '../encoder/BitBuffer';

export abstract class Segment {
  #mode: Mode;
  #bytes: number[];

  constructor(mode: Mode, bytes: number[] = []) {
    this.#mode = mode;
    this.#bytes = bytes;
  }

  public get mode(): Mode {
    return this.#mode;
  }

  public get length(): number {
    return this.#bytes.length;
  }

  public get bytes(): number[] {
    return this.#bytes;
  }

  public abstract writeTo(buffer: BitBuffer): void;
}
