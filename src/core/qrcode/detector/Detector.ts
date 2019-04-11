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

import Version from '../decoder/Version';
import ResultPoint from '../../ResultPoint';
import FinderPattern from './FinderPattern';
import BitMatrix from '../../common/BitMatrix';
import DecodeHintType from '../../DecodeHintType';
import AlignmentPattern from './AlignmentPattern';
import GridSampler from '../../common/GridSampler';
import FinderPatternInfo from './FinderPatternInfo';
import MathUtils from '../../common/detector/MathUtils';
import FinderPatternFinder from './FinderPatternFinder';
import NotFoundException from '../../NotFoundException';
import DetectorResult from '../../common/DetectorResult';
import ResultPointCallback from '../../ResultPointCallback';
import AlignmentPatternFinder from './AlignmentPatternFinder';
import GridSamplerInstance from '../../common/GridSamplerInstance';
import PerspectiveTransform from '../../common/PerspectiveTransform';

/**
 * <p>Encapsulates logic that can detect a QR Code in an image, even if the QR Code
 * is rotated or skewed, or partially obscured.</p>
 *
 * @author Sean Owen
 */
export default class Detector {
  private image: BitMatrix;
  private resultPointCallback: ResultPointCallback;

  /**
   * @constructor
   * @param image
   */
  public constructor(image: BitMatrix) {
    this.image = image;
  }

  protected getImage(): BitMatrix {
    return this.image;
  }

  protected getResultPointCallback(): ResultPointCallback {
    return this.resultPointCallback;
  }

  /**
   * <p>Detects a QR Code in an image.</p>
   *
   * @param hints optional hints to detector
   * @return {@link DetectorResult} encapsulating results of detecting a QR Code
   * @throws NotFoundException if QR Code cannot be found
   * @throws FormatException if a QR Code cannot be decoded
   */
  public detect(hints?: Map<DecodeHintType, any>): DetectorResult {
    this.resultPointCallback = hints == null ? null : hints.get(DecodeHintType.NEED_RESULT_POINT_CALLBACK);

    const finder: FinderPatternFinder = new FinderPatternFinder(this.image, this.resultPointCallback);
    const info: FinderPatternInfo = finder.find(hints);

    return this.processFinderPatternInfo(info);
  }

  protected processFinderPatternInfo(info: FinderPatternInfo): DetectorResult {
    const topLeft: FinderPattern = info.getTopLeft();
    const topRight: FinderPattern = info.getTopRight();
    const bottomLeft: FinderPattern = info.getBottomLeft();
    const moduleSize: number = this.calculateModuleSize(topLeft, topRight, bottomLeft);

    if (moduleSize < 1.0) {
      throw new NotFoundException('No pattern found in proccess finder.');
    }

    const dimension: number = Detector.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
    const provisionalVersion: Version = Version.getProvisionalVersionForDimension(dimension);
    const modulesBetweenFPCenters: number = provisionalVersion.getDimensionForVersion() - 7;

    let alignmentPattern: AlignmentPattern = null;

    // Anything above version 1 has an alignment pattern
    if (provisionalVersion.getAlignmentPatternCenters().length > 0) {
      // Guess where a "bottom right" finder pattern would have been
      const bottomRightX: number = topRight.getX() - topLeft.getX() + bottomLeft.getX();
      const bottomRightY: number = topRight.getY() - topLeft.getY() + bottomLeft.getY();
      // Estimate that alignment pattern is closer by 3 modules
      // from "bottom right" to known top left location
      const correctionToTopLeft: number = 1.0 - 3.0 / modulesBetweenFPCenters;
      const estAlignmentX: number = Math.floor(topLeft.getX() + correctionToTopLeft * (bottomRightX - topLeft.getX()));
      const estAlignmentY: number = Math.floor(topLeft.getY() + correctionToTopLeft * (bottomRightY - topLeft.getY()));

      // Kind of arbitrary -- expand search radius before giving up
      for (let i: number = 4; i <= 16; i <<= 1) {
        try {
          alignmentPattern = this.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY, i);
          break;
        } catch (re) {
          if (!(re instanceof NotFoundException)) {
            throw re;
          }
          // try next round
        }
      }
      // If we didn't find alignment pattern... well try anyway without it
    }

    const transform: PerspectiveTransform = Detector.createTransform(
      topLeft,
      topRight,
      bottomLeft,
      alignmentPattern,
      dimension
    );

    const bits: BitMatrix = Detector.sampleGrid(this.image, transform, dimension);

    let points: ResultPoint[];

    if (alignmentPattern == null) {
      points = [bottomLeft, topLeft, topRight];
    } else {
      points = [bottomLeft, topLeft, topRight, alignmentPattern];
    }

    return new DetectorResult(bits, points);
  }

  private static createTransform(
    topLeft: ResultPoint,
    topRight: ResultPoint,
    bottomLeft: ResultPoint,
    alignmentPattern: ResultPoint,
    dimension: number
  ): PerspectiveTransform {
    const dimMinusThree: number = dimension - 3.5;
    let bottomRightX: number;
    let bottomRightY: number;
    let sourceBottomRightX: number;
    let sourceBottomRightY: number;

    if (alignmentPattern != null) {
      bottomRightX = alignmentPattern.getX();
      bottomRightY = alignmentPattern.getY();
      sourceBottomRightX = dimMinusThree - 3.0;
      sourceBottomRightY = sourceBottomRightX;
    } else {
      // Don't have an alignment pattern, just make up the bottom-right point
      bottomRightX = topRight.getX() - topLeft.getX() + bottomLeft.getX();
      bottomRightY = topRight.getY() - topLeft.getY() + bottomLeft.getY();
      sourceBottomRightX = dimMinusThree;
      sourceBottomRightY = dimMinusThree;
    }

    return PerspectiveTransform.quadrilateralToQuadrilateral(
      3.5,
      3.5,
      dimMinusThree,
      3.5,
      sourceBottomRightX,
      sourceBottomRightY,
      3.5,
      dimMinusThree,
      topLeft.getX(),
      topLeft.getY(),
      topRight.getX(),
      topRight.getY(),
      bottomRightX,
      bottomRightY,
      bottomLeft.getX(),
      bottomLeft.getY()
    );
  }

  private static sampleGrid(image: BitMatrix, transform: PerspectiveTransform, dimension: number): BitMatrix {
    const sampler: GridSampler = GridSamplerInstance.getInstance();

    return sampler.sampleGridWithTransform(image, dimension, dimension, transform);
  }

  /**
   * <p>Computes the dimension (number of modules on a size) of the QR Code based on the position
   * of the finder patterns and estimated module size.</p>
   */
  private static computeDimension(
    topLeft: ResultPoint,
    topRight: ResultPoint,
    bottomLeft: ResultPoint,
    moduleSize: number
  ): number {
    const tltrCentersDimension: number = MathUtils.round(ResultPoint.distance(topLeft, topRight) / moduleSize);
    const tlblCentersDimension: number = MathUtils.round(ResultPoint.distance(topLeft, bottomLeft) / moduleSize);
    let dimension: number = Math.floor((tltrCentersDimension + tlblCentersDimension) / 2) + 7;

    // mod 4
    switch (dimension & 0x03) {
      case 0:
        dimension++;
        break;
      // 1? do nothing
      case 2:
        dimension--;
        break;
      case 3:
        throw new NotFoundException('Dimensions could be not found.');
    }

    return dimension;
  }

  /**
   * <p>Computes an average estimated module size based on estimated derived from the positions
   * of the three finder patterns.</p>
   *
   * @param topLeft detected top-left finder pattern center
   * @param topRight detected top-right finder pattern center
   * @param bottomLeft detected bottom-left finder pattern center
   * @return estimated module size
   */
  protected calculateModuleSize(topLeft: ResultPoint, topRight: ResultPoint, bottomLeft: ResultPoint): number {
    // Take the average
    return (this.calculateModuleSizeOneWay(topLeft, topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
  }

  /**
   * <p>Estimates module size based on two finder patterns -- it uses
   * {@link #sizeOfBlackWhiteBlackRunBothWays(int, int, int, int)} to figure the
   * width of each, measuring along the axis between their centers.</p>
   */
  private calculateModuleSizeOneWay(pattern: ResultPoint, otherPattern: ResultPoint): number {
    const moduleSizeEst1: number = this.sizeOfBlackWhiteBlackRunBothWays(
      Math.floor(pattern.getX()),
      Math.floor(pattern.getY()),
      Math.floor(otherPattern.getX()),
      Math.floor(otherPattern.getY())
    );
    const moduleSizeEst2: number = this.sizeOfBlackWhiteBlackRunBothWays(
      Math.floor(otherPattern.getX()),
      Math.floor(otherPattern.getY()),
      Math.floor(pattern.getX()),
      Math.floor(pattern.getY())
    );

    if (isNaN(moduleSizeEst1)) {
      return moduleSizeEst2 / 7.0;
    }

    if (isNaN(moduleSizeEst2)) {
      return moduleSizeEst1 / 7.0;
    }

    // Average them, and divide by 7 since we've counted the width of 3 black modules,
    // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
    return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
  }

  /**
   * See {@link #sizeOfBlackWhiteBlackRun(int, int, int, int)}; computes the total width of
   * a finder pattern by looking for a black-white-black run from the center in the direction
   * of another point (another finder pattern center), and in the opposite direction too.
   */
  private sizeOfBlackWhiteBlackRunBothWays(fromX: number, fromY: number, toX: number, toY: number): number {
    let result: number = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

    // Now count other way -- don't run off image though of course
    let scale: number = 1.0;
    let otherToX: number = fromX - (toX - fromX);

    if (otherToX < 0) {
      scale = fromX / (fromX - otherToX);
      otherToX = 0;
    } else if (otherToX >= this.image.getWidth()) {
      scale = (this.image.getWidth() - 1 - fromX) / (otherToX - fromX);
      otherToX = this.image.getWidth() - 1;
    }

    let otherToY: number = Math.floor(fromY - (toY - fromY) * scale);

    scale = 1.0;

    if (otherToY < 0) {
      scale = fromY / (fromY - otherToY);
      otherToY = 0;
    } else if (otherToY >= this.image.getHeight()) {
      scale = (this.image.getHeight() - 1 - fromY) / (otherToY - fromY);
      otherToY = this.image.getHeight() - 1;
    }

    otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

    result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);

    // Middle pixel is double-counted this way; subtract 1
    return result - 1.0;
  }

  /**
   * <p>This method traces a line from a point in the image, in the direction towards another point.
   * It begins in a black region, and keeps going until it finds white, then black, then white again.
   * It reports the distance from the start to this point.</p>
   *
   * <p>This is used when figuring out how wide a finder pattern is, when the finder pattern
   * may be skewed or rotated.</p>
   */
  private sizeOfBlackWhiteBlackRun(fromX: number, fromY: number, toX: number, toY: number): number {
    // Mild variant of Bresenham's algorithm
    // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
    const steep: boolean = Math.abs(toY - fromY) > Math.abs(toX - fromX);

    if (steep) {
      [fromX, fromY] = [fromY, fromX];
      [toX, toY] = [toY, toX];
    }

    const dx: number = Math.abs(toX - fromX);
    const dy: number = Math.abs(toY - fromY);
    let error: number = -dx / 2;
    const xstep: number = fromX < toX ? 1 : -1;
    const ystep: number = fromY < toY ? 1 : -1;

    // In black pixels, looking for white, first or second time.
    let state: number = 0;
    // Loop up until x == toX, but not beyond
    const xLimit: number = toX + xstep;

    for (let x: number = fromX, y: number = fromY; x !== xLimit; x += xstep) {
      const realX: number = steep ? y : x;
      const realY: number = steep ? x : y;

      // Does current pixel mean we have moved white to black or vice versa?
      // Scanning black in state 0,2 and white in state 1, so if we find the wrong
      // color, advance to next state or end if we are in state 2 already
      if ((state === 1) === this.image.get(realX, realY)) {
        if (state === 2) {
          return MathUtils.distance(x, y, fromX, fromY);
        }

        state++;
      }

      error += dy;

      if (error > 0) {
        if (y === toY) {
          break;
        }

        y += ystep;
        error -= dx;
      }
    }

    // Found black-white-black; give the benefit of the doubt that the next pixel outside the image
    // is "white" so this last point at (toX+xStep,toY) is the right ending. This is really a
    // small approximation; (toX+xStep,toY+yStep) might be really correct. Ignore this.
    if (state === 2) {
      return MathUtils.distance(toX + xstep, toY, fromX, fromY);
    }

    // else we didn't find even black-white-black; no estimate is really possible
    return NaN;
  }

  /**
   * <p>Attempts to locate an alignment pattern in a limited region of the image, which is
   * guessed to contain it. This method uses {@link AlignmentPattern}.</p>
   *
   * @param overallEstModuleSize estimated module size so far
   * @param estAlignmentX x coordinate of center of area probably containing alignment pattern
   * @param estAlignmentY y coordinate of above
   * @param allowanceFactor number of pixels in all directions to search from the center
   * @return {@link AlignmentPattern} if found, or null otherwise
   * @throws NotFoundException if an unexpected error occurs during detection
   */
  protected findAlignmentInRegion(
    overallEstModuleSize: number,
    estAlignmentX: number,
    estAlignmentY: number,
    allowanceFactor: number
  ): AlignmentPattern {
    // Look for an alignment pattern (3 modules in size) around where it
    // should be
    const allowance: number = Math.floor(allowanceFactor * overallEstModuleSize);
    const alignmentAreaLeftX: number = Math.max(0, estAlignmentX - allowance);
    const alignmentAreaRightX: number = Math.min(this.image.getWidth() - 1, estAlignmentX + allowance);

    if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
      throw new NotFoundException('Alignment top exceeds estimated module size.');
    }

    const alignmentAreaTopY: number = Math.max(0, estAlignmentY - allowance);
    const alignmentAreaBottomY: number = Math.min(this.image.getHeight() - 1, estAlignmentY + allowance);

    if (alignmentAreaBottomY - alignmentAreaTopY < overallEstModuleSize * 3) {
      throw new NotFoundException('Alignment bottom exceeds estimated module size.');
    }

    const alignmentFinder = new AlignmentPatternFinder(
      this.image,
      alignmentAreaLeftX,
      alignmentAreaTopY,
      alignmentAreaRightX - alignmentAreaLeftX,
      alignmentAreaBottomY - alignmentAreaTopY,
      overallEstModuleSize,
      this.resultPointCallback
    );

    return alignmentFinder.find();
  }
}
