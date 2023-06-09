/**
 * @module asserts
 */

import { EncodeHint } from './encoder';
import { Charset } from '/common/Charset';

export function assertContent(content: string): asserts content {
  if (!content) {
    throw new Error('segment content should be at least 1 character');
  }
}

export function assertCharset(charset: Charset): asserts charset {
  if (!(charset instanceof Charset)) {
    throw new Error('illegal charset');
  }
}

export function assertHints(hints: EncodeHint[]): asserts hints {
  if (!Array.isArray(hints)) {
    throw new Error('hints must be an array');
  }

  for (const hint of hints) {
    if (['GS1_FORMAT', 'CHARACTER_SET'].indexOf(hint) < 0) {
      throw new Error('illegal item of hints');
    }
  }
}

export function assertLevel(level: 'L' | 'M' | 'Q' | 'H'): asserts level {
  if (['L', 'M', 'Q', 'H'].indexOf(level) < 0) {
    throw new Error('illegal error correction level');
  }
}

export function assertVersion(version: number | 'auto'): asserts version {
  if (version !== 'auto') {
    if (version < 1 || version > 40 || !Number.isInteger(version)) {
      throw new Error('version must be an integer in [1 - 40] or "auto"');
    }
  }
}
