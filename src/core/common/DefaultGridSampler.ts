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

import GridSampler from './GridSampler';
import BitMatrix from './BitMatrix';
import PerspectiveTransform from './PerspectiveTransform';
import NotFoundException from '../NotFoundException';

/**
 * @author Sean Owen
 */
export default class DefaultGridSampler extends GridSampler {
  /**
   * @override
   * @param image
   * @param dimensionX
   * @param dimensionY
   * @param p1ToX
   * @param p1ToY
   * @param p2ToX
   * @param p2ToY
   * @param p3ToX
   * @param p3ToY
   * @param p4ToX
   * @param p4ToY
   * @param p1FromX
   * @param p1FromY
   * @param p2FromX
   * @param p2FromY
   * @param p3FromX
   * @param p3FromY
   * @param p4FromX
   * @param p4FromY
   */
  public sampleGrid(
    image: BitMatrix,
    dimensionX: number,
    dimensionY: number,
    p1ToX: number,
    p1ToY: number,
    p2ToX: number,
    p2ToY: number,
    p3ToX: number,
    p3ToY: number,
    p4ToX: number,
    p4ToY: number,
    p1FromX: number,
    p1FromY: number,
    p2FromX: number,
    p2FromY: number,
    p3FromX: number,
    p3FromY: number,
    p4FromX: number,
    p4FromY: number
  ): BitMatrix {
    const transform = PerspectiveTransform.quadrilateralToQuadrilateral(
      p1ToX,
      p1ToY,
      p2ToX,
      p2ToY,
      p3ToX,
      p3ToY,
      p4ToX,
      p4ToY,
      p1FromX,
      p1FromY,
      p2FromX,
      p2FromY,
      p3FromX,
      p3FromY,
      p4FromX,
      p4FromY
    );

    return this.sampleGridWithTransform(image, dimensionX, dimensionY, transform);
  }

  /**
   * @override
   * @param image
   * @param dimensionX
   * @param dimensionY
   * @param transform
   */
  public sampleGridWithTransform(
    image: BitMatrix,
    dimensionX: number,
    dimensionY: number,
    transform: PerspectiveTransform
  ): BitMatrix {
    if (dimensionX <= 0 || dimensionY <= 0) {
      throw new NotFoundException();
    }

    const bits: BitMatrix = new BitMatrix(dimensionX, dimensionY);
    const points: Float32Array = new Float32Array(2 * dimensionX);

    for (let y: number = 0; y < dimensionY; y++) {
      const max: number = points.length;
      const iValue: number = y + 0.5;

      for (let x: number = 0; x < max; x += 2) {
        points[x] = x / 2 + 0.5;
        points[x + 1] = iValue;
      }

      transform.transformPoints(points);
      // Quick check to see if points transformed to something inside the image
      // sufficient to check the endpoints
      GridSampler.checkAndNudgePoints(image, points);

      try {
        for (let x: number = 0; x < max; x += 2) {
          if (image.get(Math.floor(points[x]), Math.floor(points[x + 1]))) {
            // Black(-ish) pixel
            bits.set(x / 2, y);
          }
        }
      } catch (aioobe) {
        // This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
        // transform gets "twisted" such that it maps a straight line of points to a set of points
        // whose endpoints are in bounds, but others are not. There is probably some mathematical
        // way to detect this about the transformation that I don't know yet.
        // This results in an ugly runtime exception despite our clever checks above -- can't have
        // that. We could check each point's coordinates but that feels duplicative. We settle for
        // catching and wrapping ArrayIndexOutOfBoundsException.
        throw new NotFoundException();
      }
    }

    return bits;
  }
}
