/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * <p>Encapsulates the result of decoding a matrix of bits. This typically
 * applies to 2D barcode formats. For now it contains the raw bytes obtained,
 * as well as a String interpretation of those bytes, if applicable.</p>
 *
 * @author Sean Owen
 */
export default class DecoderResult {
  private rawBytes: Uint8Array;
  private numBits: number;
  private text: string;
  private byteSegments: Uint8Array[];
  private ecLevel: string;
  private errorsCorrected: number;
  private erasures: number;
  private other: any;
  private structuredAppendParity;
  private structuredAppendSequenceNumber: number;

  public constructor(
    rawBytes: Uint8Array,
    text: string,
    byteSegments: Uint8Array[],
    ecLevel: string,
    structuredAppendSequenceNumber: number = -1,
    structuredAppendParity: number = -1
  ) {
    this.rawBytes = rawBytes;
    this.numBits = rawBytes == null ? 0 : 8 * rawBytes.length;
    this.text = text;
    this.byteSegments = byteSegments;
    this.ecLevel = ecLevel;
    this.structuredAppendParity = structuredAppendParity;
    this.structuredAppendSequenceNumber = structuredAppendSequenceNumber;
  }

  /**
   * @return raw bytes representing the result, or {@code null} if not applicable
   */
  public getRawBytes(): Uint8Array {
    return this.rawBytes;
  }

  /**
   * @return how many bits of {@link #getRawBytes()} are valid; typically 8 times its length
   * @since 3.3.0
   */
  public getNumBits(): number {
    return this.numBits;
  }

  /**
   * @param numBits overrides the number of bits that are valid in {@link #getRawBytes()}
   * @since 3.3.0
   */
  public setNumBits(numBits: number): void {
    this.numBits = numBits;
  }

  /**
   * @return text representation of the result
   */
  public getText(): string {
    return this.text;
  }

  /**
   * @return list of byte segments in the result, or {@code null} if not applicable
   */
  public getByteSegments(): Uint8Array[] {
    return this.byteSegments;
  }

  /**
   * @return name of error correction level used, or {@code null} if not applicable
   */
  public getECLevel(): string {
    return this.ecLevel;
  }

  /**
   * @return number of errors corrected, or {@code null} if not applicable
   */
  public getErrorsCorrected(): number /*Integer*/ {
    return this.errorsCorrected;
  }

  /**
   * set number of errors corrected, or {@code null} if not applicable
   */
  public setErrorsCorrected(errorsCorrected: number): void {
    this.errorsCorrected = errorsCorrected;
  }

  /**
   * @return number of erasures corrected, or {@code null} if not applicable
   */
  public getErasures(): number {
    return this.erasures;
  }

  /**
   * set number of erasures corrected, or {@code null} if not applicable
   */
  public setErasures(erasures: number): void {
    this.erasures = erasures;
  }

  /**
   * @return arbitrary additional metadata
   */
  public getOther(): any {
    return this.other;
  }

  /**
   * set arbitrary additional metadata
   */
  public setOther(other: any): void {
    this.other = other;
  }

  public hasStructuredAppend(): boolean {
    return this.structuredAppendParity >= 0 && this.structuredAppendSequenceNumber >= 0;
  }

  public getStructuredAppendParity(): number {
    return this.structuredAppendParity;
  }

  public getStructuredAppendSequenceNumber(): number {
    return this.structuredAppendSequenceNumber;
  }
}
