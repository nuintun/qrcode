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
import DefaultGridSampler from './DefaultGridSampler';

export default class GridSamplerInstance {
  private static gridSampler: GridSampler = new DefaultGridSampler();

  /**
   * Sets the implementation of GridSampler used by the library. One global
   * instance is stored, which may sound problematic. But, the implementation provided
   * ought to be appropriate for the entire platform, and all uses of this library
   * in the whole lifetime of the JVM. For instance, an Android activity can swap in
   * an implementation that takes advantage of native platform libraries.
   *
   * @param newGridSampler The platform-specific object to install.
   */
  public static setGridSampler(newGridSampler: GridSampler): void {
    GridSamplerInstance.gridSampler = newGridSampler;
  }

  /**
   * @return the current implementation of GridSampler
   */
  public static getInstance(): GridSampler {
    return GridSamplerInstance.gridSampler;
  }
}
