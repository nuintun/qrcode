/**
 * @module asserts
 */

import { Hints } from './encoder';
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

export function assertHints(hints: Hints): asserts hints {
  const { fnc1 } = hints;

  // FNC1
  if (fnc1 != null) {
    const [mode] = fnc1;

    if (mode !== 'GS1' && mode !== 'AIM') {
      throw new Error('illegal fn1 hint');
    }

    if (mode === 'AIM') {
      const [, indicator] = fnc1;

      if (indicator < 0 || indicator > 0xff) {
        throw new Error('illegal fn1 application indicator');
      }
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
      throw new Error('version must be "auto" or an integer in [1 - 40]');
    }
  }
}
