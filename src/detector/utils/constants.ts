/**
 * @module constants
 */

const RADIAN = Math.PI / 180;

// Top left min and max angle
export const MIN_TOP_LEFT_ANGLE = RADIAN * 45;
export const MAX_TOP_LEFT_ANGLE = RADIAN * 135;

// Diff ratio
export const DIFF_MODULE_SIZE_RATIO = 0.5;
export const DIFF_FINDER_PATTERN_RATIO = 0.58;
export const DIFF_ALIGNMENT_PATTERN_RATIO = 0.8;

// Pattern scanline size ratios
export const FINDER_PATTERN_RATIOS = [1, 1, 3, 1, 1];
export const ALIGNMENT_PATTERN_RATIOS = [1, 1, 1, 1, 1];
