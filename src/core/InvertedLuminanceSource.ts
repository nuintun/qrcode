/*
 * Copyright 2009 ZXing authors
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

import LuminanceSource from './LuminanceSource';

/**
 * A wrapper implementation of {@link LuminanceSource} which inverts the luminances it returns -- black becomes
 * white and vice versa, and each value becomes (255-value).
 *
 * @author Sean Owen
 */
export default class InvertedLuminanceSource extends LuminanceSource {
  private delegate: LuminanceSource;

  public constructor(delegate: LuminanceSource) {
    super(delegate.getWidth(), delegate.getHeight());

    this.delegate = delegate;
  }

  /**
   * @override
   * @param y
   * @param row
   */
  public getRow(y: number, row?: Uint8Array): Uint8Array {
    const sourceRow: Uint8Array = this.delegate.getRow(y, row);
    const width: number = this.getWidth();

    for (let i: number = 0; i < width; i++) {
      sourceRow[i] = 255 - (sourceRow[i] & 0xff);
    }

    return sourceRow;
  }

  /**
   * @override
   */
  public getMatrix(): Uint8Array {
    const matrix: Uint8Array = this.delegate.getMatrix();
    const length: number = this.getWidth() * this.getHeight();
    const invertedMatrix: Uint8Array = new Uint8Array(length);

    for (let i: number = 0; i < length; i++) {
      invertedMatrix[i] = 255 - (matrix[i] & 0xff);
    }

    return invertedMatrix;
  }

  /**
   * @override
   */
  public isCropSupported(): boolean {
    return this.delegate.isCropSupported();
  }

  /**
   * @override
   * @param left
   * @param top
   * @param width
   * @param height
   */
  public crop(left: number, top: number, width: number, height: number): LuminanceSource {
    return new InvertedLuminanceSource(this.delegate.crop(left, top, width, height));
  }

  /**
   * @override
   */
  public isRotateSupported(): boolean {
    return this.delegate.isRotateSupported();
  }

  /**
   * @override
   * @return original delegate {@link LuminanceSource} since invert undoes itself
   */
  public invert(): LuminanceSource {
    return this.delegate;
  }

  /**
   * @override
   */
  public rotateCounterClockwise(): LuminanceSource {
    return new InvertedLuminanceSource(this.delegate.rotateCounterClockwise());
  }

  /**
   * @override
   */
  public rotateCounterClockwise45(): LuminanceSource {
    return new InvertedLuminanceSource(this.delegate.rotateCounterClockwise45());
  }
}
