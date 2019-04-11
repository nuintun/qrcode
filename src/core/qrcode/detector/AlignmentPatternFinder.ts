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

import BitMatrix from '../../common/BitMatrix';
import AlignmentPattern from './AlignmentPattern';
import NotFoundException from '../../NotFoundException';
import ResultPointCallback from '../../ResultPointCallback';

/**
 * <p>This class attempts to find alignment patterns in a QR Code. Alignment patterns look like finder
 * patterns but are smaller and appear at regular intervals throughout the image.</p>
 *
 * <p>At the moment this only looks for the bottom-right alignment pattern.</p>
 *
 * <p>This is mostly a simplified copy of {@link FinderPatternFinder}. It is copied,
 * pasted and stripped down here for maximum performance but does unfortunately duplicate
 * some code.</p>
 *
 * <p>This class is thread-safe but not reentrant. Each thread must allocate its own object.</p>
 *
 * @author Sean Owen
 */
export default class AlignmentPatternFinder {
  private image: BitMatrix;
  private possibleCenters: AlignmentPattern[];
  private startX: number;
  private startY: number;
  private width: number;
  private height: number;
  private moduleSize: number;
  private crossCheckStateCount: Int32Array;
  private resultPointCallback: ResultPointCallback;

  /**
   * <p>Creates a finder that will look in a portion of the whole image.</p>
   *
   * @param image image to search
   * @param startX left column from which to start searching
   * @param startY top row from which to start searching
   * @param width width of region to search
   * @param height height of region to search
   * @param moduleSize estimated module size so far
   */
  public constructor(
    image: BitMatrix,
    startX: number,
    startY: number,
    width: number,
    height: number,
    moduleSize: number,
    resultPointCallback: ResultPointCallback
  ) {
    this.image = image;
    this.possibleCenters = [];
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    this.moduleSize = moduleSize;
    // TYPESCRIPTPORT: array initialization without size as the length is checked below
    this.crossCheckStateCount = new Int32Array(3);
    this.resultPointCallback = resultPointCallback;
  }

  /**
   * <p>This method attempts to find the bottom-right alignment pattern in the image. It is a bit messy since
   * it's pretty performance-critical and so is written to be fast foremost.</p>
   *
   * @return {@link AlignmentPattern} if found
   * @throws NotFoundException if not found
   */
  public find(): AlignmentPattern {
    const image: BitMatrix = this.image;
    const startX: number = this.startX;
    const height: number = this.height;
    const width: number = this.width;
    const maxJ: number = startX + width;
    const middleI: number = this.startY + height / 2;
    // We are looking for black/white/black modules in 1:1:1 ratio
    // this tracks the number of black/white/black modules seen so far
    const stateCount: Int32Array = new Int32Array(3);

    for (let iGen: number = 0; iGen < height; iGen++) {
      // Search from middle outwards
      const i: number = middleI + ((iGen & 0x01) === 0 ? Math.floor((iGen + 1) / 2) : -Math.floor((iGen + 1) / 2));

      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;

      let j: number = startX;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (j < maxJ && !image.get(j, i)) {
        j++;
      }

      let currentState: number = 0;

      while (j < maxJ) {
        if (image.get(j, i)) {
          // Black pixel
          if (currentState === 1) {
            // Counting black pixels
            stateCount[1]++;
          } else {
            // Counting white pixels
            if (currentState === 2) {
              // A winner?
              if (this.foundPatternCross(stateCount)) {
                // Yes
                const confirmed: AlignmentPattern = this.handlePossibleCenter(stateCount, i, j);

                if (confirmed !== null) {
                  return confirmed;
                }
              }

              stateCount[0] = stateCount[2];
              stateCount[1] = 1;
              stateCount[2] = 0;
              currentState = 1;
            } else {
              stateCount[++currentState]++;
            }
          }
        } else {
          // White pixel
          if (currentState === 1) {
            // Counting black pixels
            currentState++;
          }

          stateCount[currentState]++;
        }

        j++;
      }

      if (this.foundPatternCross(stateCount)) {
        const confirmed: AlignmentPattern = this.handlePossibleCenter(stateCount, i, maxJ);

        if (confirmed !== null) {
          return confirmed;
        }
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    if (this.possibleCenters.length !== 0) {
      return this.possibleCenters[0];
    }

    throw new NotFoundException();
  }

  /**
   * Given a count of black/white/black pixels just seen and an end position,
   * figures the location of the center of this black/white/black run.
   */
  private static centerFromEnd(stateCount: Int32Array, end: number): number {
    return end - stateCount[2] - stateCount[1] / 2.0;
  }

  /**
   * @param stateCount count of black/white/black pixels just read
   * @return true iff the proportions of the counts is close enough to the 1/1/1 ratios
   *         used by alignment patterns to be considered a match
   */
  private foundPatternCross(stateCount: Int32Array): boolean {
    const moduleSize: number = this.moduleSize;
    const maxVariance: number = moduleSize / 2.0;

    for (let i: number = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }

    return true;
  }

  /**
   * <p>After a horizontal scan finds a potential alignment pattern, this method
   * "cross-checks" by scanning down vertically through the center of the possible
   * alignment pattern to see if the same proportion is detected.</p>
   *
   * @param startI row where an alignment pattern was detected
   * @param centerJ center of the section that appears to cross an alignment pattern
   * @param maxCount maximum reasonable number of modules that should be
   * observed in any reading state, based on the results of the horizontal scan
   * @return vertical center of alignment pattern, or {@link Float#NaN} if not found
   */
  private crossCheckVertical(startI: number, centerJ: number, maxCount: number, originalStateCountTotal: number): number {
    const image: BitMatrix = this.image;
    const maxI: number = image.getHeight();
    const stateCount: Int32Array = this.crossCheckStateCount;

    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;

    // Start counting up from center
    let i: number = startI;

    while (i >= 0 && image.get(centerJ, i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }

    // If already too many modules in this state or ran off the edge:
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }

    while (i >= 0 && !image.get(centerJ, i) && stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }

    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    i = startI + 1;

    while (i < maxI && image.get(centerJ, i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i++;
    }

    if (i === maxI || stateCount[1] > maxCount) {
      return NaN;
    }

    while (i < maxI && !image.get(centerJ, i) && stateCount[2] <= maxCount) {
      stateCount[2]++;
      i++;
    }

    if (stateCount[2] > maxCount) {
      return NaN;
    }

    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];

    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
      return NaN;
    }

    return this.foundPatternCross(stateCount) ? AlignmentPatternFinder.centerFromEnd(stateCount, i) : NaN;
  }

  /**
   * <p>This is called when a horizontal scan finds a possible alignment pattern. It will
   * cross check with a vertical scan, and if successful, will see if this pattern had been
   * found on a previous horizontal scan. If so, we consider it confirmed and conclude we have
   * found the alignment pattern.</p>
   *
   * @param stateCount reading state module counts from horizontal scan
   * @param i row where alignment pattern may be found
   * @param j end of possible alignment pattern in row
   * @return {@link AlignmentPattern} if we have found the same pattern twice, or null if not
   */
  private handlePossibleCenter(stateCount: Int32Array, i: number, j: number): AlignmentPattern {
    const stateCountTotal: number = stateCount[0] + stateCount[1] + stateCount[2];
    const centerJ: number = AlignmentPatternFinder.centerFromEnd(stateCount, j);
    const centerI: number = this.crossCheckVertical(i, centerJ, 2 * stateCount[1], stateCountTotal);

    if (!isNaN(centerI)) {
      const estimatedModuleSize: number = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;

      for (const center of this.possibleCenters) {
        // Look for about the same center and module size:
        if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
          return center.combineEstimate(centerI, centerJ, estimatedModuleSize);
        }
      }

      // Hadn't found this before; save it
      const point: AlignmentPattern = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);

      this.possibleCenters.push(point);

      if (this.resultPointCallback !== null && this.resultPointCallback !== undefined) {
        this.resultPointCallback.foundPossibleResultPoint(point);
      }
    }

    return null;
  }
}
