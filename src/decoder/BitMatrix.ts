/**
 * @module BitMatrix
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

export class BitMatrix {
  public width: number;
  public height: number;
  private matrix: Uint8ClampedArray;

  constructor(matrix: Uint8ClampedArray, width: number) {
    this.width = width;
    this.matrix = matrix;
    this.height = matrix.length / width;
  }

  public static createEmpty(width: number, height: number): BitMatrix {
    return new BitMatrix(new Uint8ClampedArray(width * height), width);
  }

  public get(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }

    return !!this.matrix[y * this.width + x];
  }

  public set(x: number, y: number, value: boolean): void {
    this.matrix[y * this.width + x] = value ? 1 : 0;
  }

  public setRegion(left: number, top: number, width: number, height: number, value: boolean): void {
    for (let y = top; y < top + height; y++) {
      for (let x = left; x < left + width; x++) {
        this.set(x, y, !!value);
      }
    }
  }
}
