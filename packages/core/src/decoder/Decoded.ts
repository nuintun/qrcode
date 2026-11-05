/**
 * @module Decoded
 */

import { FNC1 } from '/common/interface';
import { FormatInfo } from './FormatInfo';
import { Version } from '/common/Version';
import { ECLevel, Level } from '/common/ECLevel';
import { DecodeSource, Structured } from './utils/source';

export class Decoded {
  #mask: number;
  #level: ECLevel;
  #version: Version;
  #corrected: number;
  #mirrored: boolean;
  #metadata: DecodeSource;

  constructor(metadata: DecodeSource, version: Version, { mask, level }: FormatInfo, corrected: number, mirrored: boolean) {
    this.#mask = mask;
    this.#level = level;
    this.#version = version;
    this.#metadata = metadata;
    this.#mirrored = mirrored;
    this.#corrected = corrected;
  }

  /**
   * @property mask
   * @description Get the mask of qrcode.
   */
  public get mask(): number {
    return this.#mask;
  }

  /**
   * @property level
   * @description Get the error correction level of qrcode.
   */
  public get level(): `${Level}` {
    return this.#level.name;
  }

  /**
   * @property version
   * @description Get the version of qrcode.
   */
  public get version(): number {
    return this.#version.version;
  }

  /**
   * @property mirrored
   * @description Whether the symbol was decoded mirrored.
   */
  public get mirrored(): boolean {
    return this.#mirrored;
  }

  /**
   * @property content
   * @description Get the content of qrcode.
   */
  public get content(): string {
    return this.#metadata.content;
  }

  /**
   * @property corrected
   * @description Get the corrected of qrcode.
   */
  public get corrected(): number {
    return this.#corrected;
  }

  /**
   * @property symbology
   * @description Get the symbology of qrcode.
   */
  public get symbology(): string {
    return this.#metadata.symbology;
  }

  /**
   * @property fnc1
   * @description Get the fnc1 of qrcode.
   */
  public get fnc1(): FNC1 | false {
    return this.#metadata.fnc1;
  }

  /**
   * @property codewords
   * @description Get the codewords of qrcode.
   */
  public get codewords(): Uint8Array {
    return this.#metadata.codewords;
  }

  /**
   * @property structured
   * @description Get the structured of qrcode.
   */
  public get structured(): Structured | false {
    return this.#metadata.structured;
  }
}
