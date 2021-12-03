/**
 * @module QRCode
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

import { Point } from './Point';
import { BitMatrix } from './BitMatrix';
import { locate, QRLocation } from './locator';
import { decode, DecodeResult } from './decoder';
import { extract, ExtractResult } from './extractor';
import { binarize, BinarizeResult, GreyscaleWeights } from './binarizer';

export interface DecoderResult extends DecodeResult {
  location: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
    topLeftFinder: Point;
    topRightFinder: Point;
    bottomLeftFinder: Point;
    bottomRightAlignment: Point | null;
  };
}

function scan(matrix: BitMatrix): DecoderResult | null {
  const locations: QRLocation[] | null = locate(matrix);

  if (locations === null) {
    return null;
  }

  for (const location of locations) {
    const extracted: ExtractResult = extract(matrix, location);
    const decoded: DecodeResult | null = decode(extracted.matrix);

    if (decoded !== null) {
      const dimension: number = location.dimension;

      return {
        ...decoded,
        location: {
          topLeft: extracted.mappingFunction(0, 0),
          topRight: extracted.mappingFunction(dimension, 0),
          bottomLeft: extracted.mappingFunction(0, dimension),
          bottomRight: extracted.mappingFunction(dimension, dimension),
          topLeftFinder: location.topLeft,
          topRightFinder: location.topRight,
          bottomLeftFinder: location.bottomLeft,
          bottomRightAlignment: decoded.version > 1 ? location.alignmentPattern : null
        }
      };
    }
  }

  return null;
}

export interface Options {
  canOverwriteImage?: boolean;
  greyScaleWeights?: GreyscaleWeights;
  inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst';
}

function disposeImageEvents(image: HTMLImageElement): void {
  image.onload = null;
  image.onerror = null;
}

export class Decoder {
  constructor(private options: Options = {}) {}

  /**
   * @public
   * @method setOptions
   * @param {object} options
   */
  public setOptions(options: Options = {}): Decoder {
    this.options = options;

    return this;
  }

  /**
   * @public
   * @method decode
   * @param {Uint8ClampedArray} data
   * @param {number} width
   * @param {number} height
   * @returns {DecoderResult}
   */
  public decode(data: Uint8ClampedArray, width: number, height: number): DecoderResult | null {
    const options: Options = this.options;
    const { canOverwriteImage, greyScaleWeights, inversionAttempts = 'attemptBoth' }: Options = options;
    const tryInvertedFirst: boolean = inversionAttempts === 'onlyInvert' || inversionAttempts === 'invertFirst';
    const invert: boolean = tryInvertedFirst || inversionAttempts === 'attemptBoth';
    const { binarized, inverted }: BinarizeResult = binarize(data, width, height, invert, greyScaleWeights, canOverwriteImage);

    let result: DecoderResult | null = scan(tryInvertedFirst ? (inverted as BitMatrix) : binarized);

    if (result !== null && (options.inversionAttempts === 'attemptBoth' || options.inversionAttempts === 'invertFirst')) {
      result = scan(tryInvertedFirst ? binarized : (inverted as BitMatrix));
    }

    return result;
  }

  /**
   * @public
   * @method scan
   * @param {string} src
   * @returns {Promise}
   */
  public scan(src: string): Promise<DecoderResult> {
    return new Promise((resolve, reject) => {
      const image: HTMLImageElement = new Image();

      // Image cross origin
      image.crossOrigin = 'anonymous';

      image.onload = () => {
        disposeImageEvents(image);

        const width: number = image.width;
        const height: number = image.height;
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

        if (context === null) {
          return reject(new Error(`browser does not support canvas.getContext('2d')`));
        }

        canvas.width = width;
        canvas.height = height;

        context.drawImage(image, 0, 0);

        const { data }: ImageData = context.getImageData(0, 0, width, height);
        const result: DecoderResult | null = this.decode(data, width, height);

        if (result !== null) {
          return resolve(result);
        }

        return reject(new Error('failed to decode image'));
      };

      image.onerror = () => {
        disposeImageEvents(image);

        reject(new Error(`failed to load image: ${src}`));
      };

      image.src = src;
    });
  }
}
