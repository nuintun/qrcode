/**
 * @module bench
 */

import { Alphanumeric, BitMatrix, Byte, Decoder, Encoder, Hanzi, Kanji, Numeric } from '@nuintun/qrcode';

interface Fixture {
  size: number;
  mask: number;
  name: string;
  level: string;
  content: string;
  version: number;
  matrix: BitMatrix;
  corrupted?: boolean;
  segments: Segment[];
}

type Level = (typeof LEVELS)[number];

const LEVELS = ['L', 'M', 'Q', 'H'] as const;

type Segment = Byte | Numeric | Alphanumeric | Hanzi | Kanji;

const ALPHANUMERIC_TEXT = 'NUINTUN QRCODE 0123456789 $%*+-./:';

function repeat(text: string, length: number): string {
  let out = '';

  while (out.length < length) {
    out += text;
  }

  return out.slice(0, length);
}

function toBitMatrix(encoded: { size: number; get(x: number, y: number): 0 | 1 }): BitMatrix {
  const matrix = new BitMatrix(encoded.size);

  for (let y = 0; y < encoded.size; y++) {
    for (let x = 0; x < encoded.size; x++) {
      if (encoded.get(x, y) === 1) {
        matrix.set(x, y);
      }
    }
  }

  return matrix;
}

function buildFixture(level: Level, lengths: number[]): Fixture[] {
  const fixtures: Fixture[] = [];

  for (const length of lengths) {
    let encoded;

    const payload = repeat('NUINTUN-QRCODE/#bench;', length);

    try {
      encoded = new Encoder({ level }).encode(new Byte(payload));
    } catch {
      // Payload doesn't fit this level, skip.
      continue;
    }

    fixtures.push({
      level,
      content: payload,
      mask: encoded.mask,
      size: encoded.size,
      version: encoded.version,
      matrix: toBitMatrix(encoded),
      segments: [new Byte(payload)],
      name: `byte ${level} v${encoded.version} ${length}ch`
    });
  }

  return fixtures;
}

function buildMixedFixture(level: Level): Fixture {
  const segments: Segment[] = [
    new Hanzi('你好世界'),
    new Byte('ASCII-BYTE'),
    new Kanji('こんにちは世界'),
    new Numeric('0123456789'),
    new Alphanumeric(ALPHANUMERIC_TEXT)
  ];
  const encoded = new Encoder({ level }).encode(...segments);
  const content = `你好世界ASCII-BYTEこんにちは世界0123456789${ALPHANUMERIC_TEXT}`;

  return {
    level,
    content,
    segments,
    mask: encoded.mask,
    size: encoded.size,
    version: encoded.version,
    matrix: toBitMatrix(encoded),
    name: `mixed ${level} v${encoded.version}`
  };
}

// Deterministic LCG so corrupted fixtures are reproducible.
function lcg(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;

    return state / 0x100000000;
  };
}

function corruptFixture(fixture: Fixture, maxFlips: number): Fixture {
  const { size } = fixture;
  const random = lcg(0x5eed);
  const decoder = new Decoder();

  for (let flips = 1; flips <= maxFlips; flips++) {
    const matrix = fixture.matrix.clone();
    const points: [number, number][] = [];

    for (let i = 0; i < flips; i++) {
      const x = Math.floor(random() * size);
      const y = Math.floor(random() * size);

      points.push([x, y]);
      matrix.flip(x, y);
    }

    try {
      const decoded = decoder.decode(matrix);

      // A flip on a function-pattern module doesn't touch codewords;
      // only accept flips the Reed-Solomon decoder actually corrected.
      if (decoded.content !== fixture.content || decoded.corrected === 0) {
        continue;
      }

      return {
        ...fixture,
        matrix,
        corrupted: true,
        name: `${fixture.name} +${flips}bit errors`
      };
    } catch {
      // Flipped a function pattern module, try different positions.
    }
  }

  return fixture;
}

function timeLoop(fn: () => void, iterations: number): number {
  const start = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    fn();
  }

  return Number(process.hrtime.bigint() - start);
}

function benchFn(name: string, fixture: Fixture, run: () => void): void {
  // Warmup for JIT.
  timeLoop(run, 30);

  // Calibrate iteration count to ~400ms per fixture.
  const estimate = timeLoop(run, 5) / 5;
  const iterations = Math.max(5, Math.min(50000, Math.round(4e8 / estimate)));
  const elapsed = timeLoop(run, iterations);
  const usPerOp = elapsed / iterations / 1000;

  console.log(
    name.padEnd(38) + `${fixture.version}`.padStart(4) + `${iterations}`.padStart(12) + usPerOp.toFixed(1).padStart(12)
  );
}

function benchDecode(fixture: Fixture, decoder: Decoder): void {
  benchFn(`${fixture.name} decode`, fixture, () => decoder.decode(fixture.matrix));
}

function benchEncode(fixture: Fixture, encoder: Encoder): void {
  benchFn(`${fixture.name} encode`, fixture, () => encoder.encode(...fixture.segments));
}

function main(): void {
  const decoder = new Decoder();
  const fixtures: Fixture[] = [];

  for (const level of LEVELS) {
    fixtures.push(...buildFixture(level, [8, 60, 220, 600, 1600]));
    fixtures.push(buildMixedFixture(level));
  }

  // Error-correction path: flip a few data modules of the biggest fixture.
  const biggest = fixtures.reduce((a, b) => (b.matrix.width > a.matrix.width ? b : a));

  fixtures.push(corruptFixture(biggest, 6));

  // Correctness first: every fixture must round-trip with stable metadata.
  for (const fixture of fixtures) {
    const decoded = decoder.decode(fixture.matrix);

    if (decoded.content !== fixture.content) {
      throw new Error(`round-trip failed: ${fixture.name}`);
    }

    if (decoded.mask !== fixture.mask || decoded.version !== fixture.version) {
      throw new Error(`metadata mismatch: ${fixture.name}`);
    }

    if (fixture.corrupted && decoded.corrected === 0) {
      throw new Error(`expected corrections: ${fixture.name}`);
    }
  }

  const header = `${'fixture'.padEnd(38)}${'ver'.padStart(4)}${'iters'.padStart(12)}${'us/op'.padStart(12)}`;
  const line = '-'.repeat(66);

  console.log(header);
  console.log(line);

  for (const fixture of fixtures) {
    if (fixture.corrupted) {
      continue;
    }

    benchEncode(fixture, new Encoder({ level: fixture.level as Level }));
  }

  console.log(header);
  console.log(line);

  for (const fixture of fixtures) {
    benchDecode(fixture, decoder);
  }
}

main();
