/**
 * @module QRCode
 */

import { FNC1 } from '/common/interface';
import { ECLevel } from '/common/ECLevel';
import { FormatInfo } from './FormatInfo';
import { Version } from '/common/Version';
import { DecodeResult, Structured } from './utils/source';

export class QRCode {
  #mask: number;
  #level: ECLevel;
  #version: Version;
  #metadata: DecodeResult;

  constructor(metadata: DecodeResult, version: Version, { mask, level }: FormatInfo) {
    this.#mask = mask;
    this.#level = level;
    this.#version = version;
    this.#metadata = metadata;
  }

  /**
   * @property mask
   * @description Get the mask of qrcode
   */
  public get mask(): number {
    return this.#mask;
  }

  /**
   * @property level
   * @description Get the error correction level of qrcode
   */
  public get level(): string {
    return this.#level.name;
  }

  /**
   * @property version
   * @description Get the version of qrcode
   */
  public get version(): number {
    return this.#version.version;
  }

  /**
   * @property content
   * @description Get the content of qrcode
   */
  public get content(): string {
    return this.#metadata.content;
  }

  /**
   * @property symbology
   * @description Get the symbology of qrcode
   */
  public get symbology(): string {
    return this.#metadata.symbology;
  }

  /**
   * @property fnc1
   * @description Get the fnc1 of qrcode
   */
  public get fnc1(): FNC1 | false {
    return this.#metadata.fnc1;
  }

  /**
   * @property codewords
   * @description Get the codewords of qrcode
   */
  public get codewords(): Uint8Array {
    return this.#metadata.codewords;
  }

  /**
   * @property structured
   * @description Get the structured of qrcode
   */
  public get structured(): Structured | false {
    return this.#metadata.structured;
  }
}
