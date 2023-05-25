/**
 * @module FinderPatternInfo
 */

import { FinderPattern } from './FinderPattern';

export class FinderPatternInfo {
  public topLeft: FinderPattern;
  public topRight: FinderPattern;
  public bottomLeft: FinderPattern;

  public constructor(patternCenters: FinderPattern[]) {
    this.topLeft = patternCenters[1];
    this.topRight = patternCenters[2];
    this.bottomLeft = patternCenters[0];
  }
}
