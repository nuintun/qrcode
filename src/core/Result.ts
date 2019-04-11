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

import System from './util/System';
import ResultPoint from './ResultPoint';
import BarcodeFormat from './BarcodeFormat';
import ResultMetadataType from './ResultMetadataType';

/**
 * <p>Encapsulates the result of decoding a barcode within an image.</p>
 *
 * @author Sean Owen
 */
export default class Result {
  private text: string;
  private rawBytes: Uint8Array;
  private numBits: number;
  private resultPoints: ResultPoint[];
  private format: BarcodeFormat;
  private resultMetadata: Map<ResultMetadataType, any>;
  private timestamp: number;

  /**
   * @constructor
   * @param text
   * @param rawBytes
   * @param numBits
   * @param resultPoints
   * @param format
   * @param timestamp
   */
  public constructor(
    text: string,
    rawBytes: Uint8Array,
    numBits: number,
    resultPoints: ResultPoint[],
    format: BarcodeFormat,
    timestamp: number
  ) {
    this.text = text;
    this.rawBytes = rawBytes;

    if (numBits == null) {
      this.numBits = rawBytes == null ? 0 : 8 * rawBytes.length;
    } else {
      this.numBits = numBits;
    }

    this.resultPoints = resultPoints;
    this.format = format;
    this.resultMetadata = null;

    if (timestamp == null) {
      this.timestamp = System.currentTimeMillis();
    } else {
      this.timestamp = timestamp;
    }
  }

  /**
   * @return raw text encoded by the barcode
   */
  public getText(): string {
    return this.text;
  }

  /**
   * @return raw bytes encoded by the barcode, if applicable, otherwise {@code null}
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
   * @return points related to the barcode in the image. These are typically points
   *         identifying finder patterns or the corners of the barcode. The exact meaning is
   *         specific to the type of barcode that was decoded.
   */
  public getResultPoints(): ResultPoint[] {
    return this.resultPoints;
  }

  /**
   * @return {@link BarcodeFormat} representing the format of the barcode that was decoded
   */
  public getBarcodeFormat(): BarcodeFormat {
    return this.format;
  }

  /**
   * @return {@link Map} mapping {@link ResultMetadataType} keys to values. May be
   *   {@code null}. This contains optional metadata about what was detected about the barcode,
   *   like orientation.
   */
  public getResultMetadata(): Map<ResultMetadataType, any> {
    return this.resultMetadata;
  }

  public putMetadata(type: ResultMetadataType, value: any): void {
    if (this.resultMetadata == null) {
      this.resultMetadata = new Map<ResultMetadataType, any>();
    }

    this.resultMetadata.set(type, value);
  }

  public putAllMetadata(metadata: Map<ResultMetadataType, any>): void {
    if (metadata != null) {
      if (this.resultMetadata == null) {
        this.resultMetadata = metadata;
      } else {
        this.resultMetadata = new Map(metadata);
      }
    }
  }

  public addResultPoints(newPoints: ResultPoint[]): void {
    const oldPoints: ResultPoint[] = this.resultPoints;

    if (oldPoints == null) {
      this.resultPoints = newPoints;
    } else if (newPoints != null && newPoints.length > 0) {
      const allPoints: ResultPoint[] = [];

      System.arraycopy(oldPoints, 0, allPoints, 0, oldPoints.length);
      System.arraycopy(newPoints, 0, allPoints, oldPoints.length, newPoints.length);

      this.resultPoints = allPoints;
    }
  }

  public getTimestamp(): number {
    return this.timestamp;
  }

  /**
   * @override
   */
  public toString(): string {
    return this.text;
  }
}
