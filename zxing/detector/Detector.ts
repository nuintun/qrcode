/**
 * @module Detector
 */

import { BitMatrix } from '/common/BitMatrix';
import { FinderPattern } from './FinderPattern';
import { distance, Point } from '/common/Point';
import { GridSampler } from '/common/GridSampler';
import { fromVersionSize } from '/common/Version';
import { AlignmentPattern } from './AlignmentPattern';
import { FinderPatternInfo } from './FinderPatternInfo';
import { FinderPatternFinder } from './FinderPatternFinder';
import { AlignmentPatternFinder } from './AlignmentPatternFinder';
import { quadrilateralToQuadrilateral } from '/common/PerspectiveTransform';

export interface DetectResult {
  readonly matrix: BitMatrix;
  readonly finderPatternInfo: FinderPatternInfo;
}

function round(value: number): number {
  return Math.floor(value + (value < 0 ? -0.5 : 0.5));
}

function computeSymbolSize(
  moduleSize: number,
  topLeft: FinderPattern,
  topRight: FinderPattern,
  bottomLeft: FinderPattern
): number {
  const tltrCentersSize = round(distance(topLeft, topRight) / moduleSize);
  const tlblCentersSize = round(distance(topLeft, bottomLeft) / moduleSize);
  const size = Math.floor((tltrCentersSize + tlblCentersSize) / 2 + 7);

  // mod 4
  switch (size & 0x03) {
    case 0:
      return size + 1;
    case 2:
      return size - 1;
    case 3:
      throw new Error('can not compute symbol size');
  }

  return size;
}

function createTransform(
  size: number,
  topLeft: FinderPattern,
  topRight: FinderPattern,
  bottomLeft: FinderPattern,
  alignmentPattern?: AlignmentPattern
) {
  let bottomRightX;
  let bottomRightY;
  let sourceBottomRightX;
  let sourceBottomRightY;

  const dimMinusThree = size - 3.5;

  if (alignmentPattern != null) {
    bottomRightX = alignmentPattern.x;
    bottomRightY = alignmentPattern.y;
    sourceBottomRightX = dimMinusThree - 3;
    sourceBottomRightY = sourceBottomRightX;
  } else {
    // Don't have an alignment pattern, just make up the bottom-right point
    bottomRightX = topRight.x - topLeft.x + bottomLeft.x;
    bottomRightY = topRight.y - topLeft.y + bottomLeft.y;
    sourceBottomRightX = dimMinusThree;
    sourceBottomRightY = dimMinusThree;
  }

  return quadrilateralToQuadrilateral(
    3.5,
    3.5,
    dimMinusThree,
    3.5,
    sourceBottomRightX,
    sourceBottomRightY,
    3.5,
    dimMinusThree,
    topLeft.x,
    topLeft.y,
    topRight.x,
    topRight.y,
    bottomRightX,
    bottomRightY,
    bottomLeft.x,
    bottomLeft.y
  );
}

export class Detector {
  #matrix: BitMatrix;

  constructor(matrix: BitMatrix) {
    this.#matrix = matrix;
  }

  #sizeOfBlackWhiteBlackRun(fromX: number, fromY: number, toX: number, toY: number): number {
    const matrix = this.#matrix;
    // Mild variant of Bresenham's algorithm;
    // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
    const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);

    if (steep) {
      [fromX, fromY, toX, toY] = [fromY, fromX, toY, toX];
    }

    const xStep = fromX < toX ? 1 : -1;
    const yStep = fromY < toY ? 1 : -1;
    const xDiff = Math.abs(toX - fromX);
    const yDiff = Math.abs(toY - fromY);

    // In black pixels, looking for white, first or second time.
    let state = 0;
    let error = -xDiff / 2;

    // Loop up until x == toX, but not beyond
    const xLimit = toX + xStep;

    for (let x = fromX, y = fromY; x !== xLimit; x += xStep) {
      const realX = steep ? y : x;
      const realY = steep ? x : y;

      // Does current pixel mean we have moved white to black or vice versa?
      // Scanning black in state 0,2 and white in state 1, so if we find the wrong
      // color, advance to next state or end if we are in state 2 already
      if ((state === 1) === (matrix.get(realX, realY) === 1)) {
        if (state++ === 2) {
          return distance(new Point(x, y), new Point(fromX, fromY));
        }
      }

      error += yDiff;

      if (error > 0) {
        if (y === toY) {
          break;
        }

        y += yStep;
        error -= xDiff;
      }
    }

    // Found black-white-black; give the benefit of the doubt that the next pixel outside the image
    // is "white" so this last point at (toX+xStep,toY) is the right ending. This is really a
    // small approximation; (toX+xStep,toY+yStep) might be really correct. Ignore this.
    if (state === 2) {
      return distance(new Point(toX + xStep, toY), new Point(fromX, fromY));
    }

    // else we didn't find even black-white-black; no estimate is really possible
    return NaN;
  }

  #sizeOfBlackWhiteBlackRunBothWays(fromX: number, fromY: number, toX: number, toY: number): number {
    // Now count other way -- don't run off image though of course
    let scale = 1;
    let otherToX = fromX - (toX - fromX);
    let size = this.#sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

    const { width, height } = this.#matrix;

    if (otherToX < 0) {
      scale = fromX / (fromX - otherToX);
      otherToX = 0;
    } else if (otherToX >= width) {
      scale = (width - 1 - fromX) / (otherToX - fromX);
      otherToX = width - 1;
    }

    let otherToY = Math.floor(fromY - (toY - fromY) * scale);

    scale = 1;

    if (otherToY < 0) {
      scale = fromY / (fromY - otherToY);
      otherToY = 0;
    } else if (otherToY >= height) {
      scale = (height - 1 - fromY) / (otherToY - fromY);
      otherToY = height - 1;
    }

    otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

    // Middle pixel is double-counted this way; subtract 1
    size += this.#sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);

    return size - 1;
  }

  #calculateModuleSizeOneWay(pattern1: FinderPattern, pattern2: FinderPattern): number {
    const moduleSizeEst1 = this.#sizeOfBlackWhiteBlackRunBothWays(
      Math.floor(pattern1.x),
      Math.floor(pattern1.y),
      Math.floor(pattern2.x),
      Math.floor(pattern2.y)
    );
    const moduleSizeEst2 = this.#sizeOfBlackWhiteBlackRunBothWays(
      Math.floor(pattern2.x),
      Math.floor(pattern2.y),
      Math.floor(pattern1.x),
      Math.floor(pattern1.y)
    );

    if (Number.isNaN(moduleSizeEst1)) {
      return moduleSizeEst2 / 7;
    }

    if (Number.isNaN(moduleSizeEst2)) {
      return moduleSizeEst1 / 7;
    }

    // Average them, and divide by 7 since we've counted the width of 3 black modules,
    // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
    return (moduleSizeEst1 + moduleSizeEst2) / 14;
  }

  #calculateModuleSize(topLeft: FinderPattern, topRight: FinderPattern, bottomLeft: FinderPattern): number {
    // Take the average
    return (this.#calculateModuleSizeOneWay(topLeft, topRight) + this.#calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2;
  }

  #findAlignmentInRegion(x: number, y: number, moduleSize: number, allowanceFactor: number): AlignmentPattern {
    // Look for an alignment pattern (3 modules in size) around where it should be
    const matrix = this.#matrix;
    const allowance = Math.floor(moduleSize * allowanceFactor);
    const alignmentAreaLeftX = Math.max(0, x - allowance);
    const alignmentAreaRightX = Math.min(matrix.width - 1, x + allowance);
    const alignmentAreaTopY = Math.max(0, y - allowance);
    const alignmentAreaBottomY = Math.min(matrix.height - 1, y + allowance);
    const width = alignmentAreaRightX - alignmentAreaLeftX;
    const height = alignmentAreaBottomY - alignmentAreaTopY;
    const minSize = moduleSize * 3;

    if (width < minSize || height < minSize) {
      throw new Error('an unexpected error occurs during detection');
    }

    const alignmentFinder = new AlignmentPatternFinder(
      this.#matrix,
      alignmentAreaLeftX,
      alignmentAreaTopY,
      width,
      height,
      moduleSize
    );

    return alignmentFinder.find();
  }

  #processFinderPatternInfo({ topLeft, topRight, bottomLeft }: FinderPatternInfo) {
    const moduleSize = this.#calculateModuleSize(topLeft, topRight, bottomLeft);

    if (moduleSize < 1) {
      throw new Error('can not detect a code that has module size enough');
    }

    const size = computeSymbolSize(moduleSize, topLeft, topRight, bottomLeft);
    const version = fromVersionSize(size);
    const modulesBetweenFPCenters = version.size - 7;

    let alignmentPattern: AlignmentPattern | undefined;

    if (version.alignmentPatterns.length > 0) {
      // Guess where a "bottom right" finder pattern would have been
      const bottomRightX = topRight.x - topLeft.x + bottomLeft.x;
      const bottomRightY = topRight.y - topLeft.y + bottomLeft.y;
      // Estimate that alignment pattern is closer by 3 modules
      // from "bottom right" to known top left location
      const correctionToTopLeft = 1 - 3 / modulesBetweenFPCenters;
      const estAlignmentX = Math.floor(topLeft.x + correctionToTopLeft * (bottomRightX - topLeft.x));
      const estAlignmentY = Math.floor(topLeft.y + correctionToTopLeft * (bottomRightY - topLeft.y));

      // Kind of arbitrary -- expand search radius before giving up
      for (let allowanceFactor = 4; allowanceFactor <= 16; allowanceFactor <<= 1) {
        try {
          alignmentPattern = this.#findAlignmentInRegion(estAlignmentX, estAlignmentY, moduleSize, allowanceFactor);
          break;
        } catch {
          // try next round
        }
      }
      // If we didn't find alignment pattern... well try anyway without it
    }

    const sampler = new GridSampler(this.#matrix);
    const transform = createTransform(size, topLeft, topRight, bottomLeft, alignmentPattern);

    return sampler.sampleGrid(size, size, transform);
  }

  public detect(): DetectResult[] {
    const matrix = this.#matrix;
    const result: DetectResult[] = [];
    const finder = new FinderPatternFinder(matrix);
    const finderPatternInfos = finder.find();

    for (const finderPatternInfo of finderPatternInfos) {
      try {
        result.push({
          finderPatternInfo,
          matrix: this.#processFinderPatternInfo(finderPatternInfo)
        });
      } catch {
        // Ignore
      }
    }

    return result;
  }
}
