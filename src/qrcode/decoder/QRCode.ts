/**
 * @module QRCode
 * @author nuintun
 * @author Cosmo Wolfe
 */

import Point from './Point';
import BitMatrix from './BitMatrix';
import decodeQRCode from './decoder';
import locate, { QRLocation } from './locator';
import extract, { ExtractResult } from './extractor';
import binarize, { BinarizeResult } from './binarizer';
import { Chunks, DecodeResult } from './decoder/decode';

export interface DecoderResult {
  data: string;
  chunks: Chunks;
  binaryData: number[];
  location: {
    topRightCorner: Point;
    topLeftCorner: Point;
    bottomRightCorner: Point;
    bottomLeftCorner: Point;
    topRightFinderPattern: Point;
    topLeftFinderPattern: Point;
    bottomLeftFinderPattern: Point;
    bottomRightAlignmentPattern?: Point;
  };
}

function scan(matrix: BitMatrix): DecoderResult {
  const location: QRLocation = locate(matrix);

  if (!location) {
    return null;
  }

  const extracted: ExtractResult = extract(matrix, location);
  const decoded: DecodeResult = decodeQRCode(extracted.matrix);

  if (!decoded) {
    return null;
  }

  return {
    data: decoded.text,
    chunks: decoded.chunks,
    binaryData: decoded.bytes,
    location: {
      topRightCorner: extracted.mappingFunction(location.dimension, 0),
      topLeftCorner: extracted.mappingFunction(0, 0),
      bottomRightCorner: extracted.mappingFunction(location.dimension, location.dimension),
      bottomLeftCorner: extracted.mappingFunction(0, location.dimension),
      topRightFinderPattern: location.topRight,
      topLeftFinderPattern: location.topLeft,
      bottomLeftFinderPattern: location.bottomLeft,
      bottomRightAlignmentPattern: location.alignmentPattern
    }
  };
}

export interface Options {
  inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst';
}

const defaultOptions: Options = {
  inversionAttempts: 'attemptBoth'
};

function disposeImageEvents(image: HTMLImageElement): void {
  image.onload = null;
  image.onerror = null;
}

export default class QRCode {
  private options: Options = defaultOptions;

  public setOptions(options: Options = {}): void {
    options = options || {};

    Object.keys(defaultOptions).forEach(key => {
      // Sad implementation of Object.assign since we target es5 not es6
      options[key] = options[key] || defaultOptions[key];
    });

    this.options = options;
  }

  public decode(data: Uint8ClampedArray, width: number, height: number): DecoderResult {
    const options: Options = this.options;
    const shouldInvert: boolean = options.inversionAttempts === 'attemptBoth' || options.inversionAttempts === 'invertFirst';
    const tryInvertedFirst: boolean = options.inversionAttempts === 'onlyInvert' || options.inversionAttempts === 'invertFirst';
    const { binarized, inverted }: BinarizeResult = binarize(data, width, height, shouldInvert);

    let result: DecoderResult = scan(tryInvertedFirst ? inverted : binarized);

    if (!result && (options.inversionAttempts === 'attemptBoth' || options.inversionAttempts === 'invertFirst')) {
      result = scan(tryInvertedFirst ? binarized : inverted);
    }

    return result;
  }

  public scan(src: string): Promise<DecoderResult> {
    return new Promise((resolve, reject) => {
      const image: HTMLImageElement = new Image();

      image.onload = () => {
        disposeImageEvents(image);

        const width: number = image.width;
        const height: number = image.height;
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const context: CanvasRenderingContext2D = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        context.drawImage(image, 0, 0);

        const data: Uint8ClampedArray = context.getImageData(0, 0, width, height).data;
        const result: DecoderResult = this.decode(data, width, height);

        if (result) {
          return resolve(result);
        }

        return reject('failed to decode image');
      };

      image.onerror = () => {
        disposeImageEvents(image);

        reject(`failed to load image: ${src}`);
      };

      image.src = src;
    });
  }
}
