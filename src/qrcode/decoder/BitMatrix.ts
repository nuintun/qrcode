export default class BitMatrix {
  public width: number;
  public height: number;
  private data: Uint8ClampedArray;

  constructor(data: Uint8ClampedArray, width: number) {
    this.data = data;
    this.width = width;
    this.height = data.length / width;
  }

  public static createEmpty(width: number, height: number) {
    return new BitMatrix(new Uint8ClampedArray(width * height), width);
  }

  public get(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }

    return !!this.data[y * this.width + x];
  }

  public set(x: number, y: number, v: boolean) {
    this.data[y * this.width + x] = v ? 1 : 0;
  }

  public setRegion(left: number, top: number, width: number, height: number, v: boolean) {
    for (let y: number = top; y < top + height; y++) {
      for (let x: number = left; x < left + width; x++) {
        this.set(x, y, !!v);
      }
    }
  }
}
