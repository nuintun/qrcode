/**
 * @module Version
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

interface ECBlock {
  numBlocks: number;
  dataCodewordsPerBlock: number;
}

export interface ECLevel {
  ecBlocks: ECBlock[];
  ecCodewordsPerBlock: number;
}

export interface Version {
  bits: number;
  version: number;
  ecLevels: ECLevel[];
  alignmentPatternCenters: number[];
}

export const VERSIONS: Version[] = [
  {
    version: 1,
    bits: 0x00000,
    alignmentPatternCenters: [],
    ecLevels: [
      {
        ecCodewordsPerBlock: 10,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }]
      },
      {
        ecCodewordsPerBlock: 7,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 19 }]
      },
      {
        ecCodewordsPerBlock: 17,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 9 }]
      },
      {
        ecCodewordsPerBlock: 13,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 13 }]
      }
    ]
  },
  {
    version: 2,
    bits: 0x00000,
    alignmentPatternCenters: [6, 18],
    ecLevels: [
      {
        ecCodewordsPerBlock: 16,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 28 }]
      },
      {
        ecCodewordsPerBlock: 10,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 34 }]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }]
      },
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 22 }]
      }
    ]
  },
  {
    version: 3,
    bits: 0x00000,
    alignmentPatternCenters: [6, 22],
    ecLevels: [
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 44 }]
      },
      {
        ecCodewordsPerBlock: 15,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 55 }]
      },
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 13 }]
      },
      {
        ecCodewordsPerBlock: 18,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 17 }]
      }
    ]
  },
  {
    version: 4,
    bits: 0x00000,
    alignmentPatternCenters: [6, 26],
    ecLevels: [
      {
        ecCodewordsPerBlock: 18,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 32 }]
      },
      {
        ecCodewordsPerBlock: 20,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 80 }]
      },
      {
        ecCodewordsPerBlock: 16,
        ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 9 }]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 24 }]
      }
    ]
  },
  {
    version: 5,
    bits: 0x00000,
    alignmentPatternCenters: [6, 30],
    ecLevels: [
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 43 }]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 108 }]
      },
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 11 },
          { numBlocks: 2, dataCodewordsPerBlock: 12 }
        ]
      },
      {
        ecCodewordsPerBlock: 18,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 15 },
          { numBlocks: 2, dataCodewordsPerBlock: 16 }
        ]
      }
    ]
  },
  {
    version: 6,
    bits: 0x00000,
    alignmentPatternCenters: [6, 34],
    ecLevels: [
      {
        ecCodewordsPerBlock: 16,
        ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 27 }]
      },
      {
        ecCodewordsPerBlock: 18,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 68 }]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 15 }]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 19 }]
      }
    ]
  },
  {
    version: 7,
    bits: 0x07c94,
    alignmentPatternCenters: [6, 22, 38],
    ecLevels: [
      {
        ecCodewordsPerBlock: 18,
        ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 31 }]
      },
      {
        ecCodewordsPerBlock: 20,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 78 }]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 13 },
          { numBlocks: 1, dataCodewordsPerBlock: 14 }
        ]
      },
      {
        ecCodewordsPerBlock: 18,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 14 },
          { numBlocks: 4, dataCodewordsPerBlock: 15 }
        ]
      }
    ]
  },
  {
    version: 8,
    bits: 0x085bc,
    alignmentPatternCenters: [6, 24, 42],
    ecLevels: [
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 38 },
          { numBlocks: 2, dataCodewordsPerBlock: 39 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 97 }]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 14 },
          { numBlocks: 2, dataCodewordsPerBlock: 15 }
        ]
      },
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 18 },
          { numBlocks: 2, dataCodewordsPerBlock: 19 }
        ]
      }
    ]
  },
  {
    version: 9,
    bits: 0x09a99,
    alignmentPatternCenters: [6, 26, 46],
    ecLevels: [
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 36 },
          { numBlocks: 2, dataCodewordsPerBlock: 37 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 116 }]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 12 },
          { numBlocks: 4, dataCodewordsPerBlock: 13 }
        ]
      },
      {
        ecCodewordsPerBlock: 20,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 16 },
          { numBlocks: 4, dataCodewordsPerBlock: 17 }
        ]
      }
    ]
  },
  {
    version: 10,
    bits: 0x0a4d3,
    alignmentPatternCenters: [6, 28, 50],
    ecLevels: [
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 43 },
          { numBlocks: 1, dataCodewordsPerBlock: 44 }
        ]
      },
      {
        ecCodewordsPerBlock: 18,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 68 },
          { numBlocks: 2, dataCodewordsPerBlock: 69 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 6, dataCodewordsPerBlock: 15 },
          { numBlocks: 2, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 6, dataCodewordsPerBlock: 19 },
          { numBlocks: 2, dataCodewordsPerBlock: 20 }
        ]
      }
    ]
  },
  {
    version: 11,
    bits: 0x0bbf6,
    alignmentPatternCenters: [6, 30, 54],
    ecLevels: [
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 1, dataCodewordsPerBlock: 50 },
          { numBlocks: 4, dataCodewordsPerBlock: 51 }
        ]
      },
      {
        ecCodewordsPerBlock: 20,
        ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 81 }]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 12 },
          { numBlocks: 8, dataCodewordsPerBlock: 13 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 22 },
          { numBlocks: 4, dataCodewordsPerBlock: 23 }
        ]
      }
    ]
  },
  {
    version: 12,
    bits: 0x0c762,
    alignmentPatternCenters: [6, 32, 58],
    ecLevels: [
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [
          { numBlocks: 6, dataCodewordsPerBlock: 36 },
          { numBlocks: 2, dataCodewordsPerBlock: 37 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 92 },
          { numBlocks: 2, dataCodewordsPerBlock: 93 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 7, dataCodewordsPerBlock: 14 },
          { numBlocks: 4, dataCodewordsPerBlock: 15 }
        ]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 20 },
          { numBlocks: 6, dataCodewordsPerBlock: 21 }
        ]
      }
    ]
  },
  {
    version: 13,
    bits: 0x0d847,
    alignmentPatternCenters: [6, 34, 62],
    ecLevels: [
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [
          { numBlocks: 8, dataCodewordsPerBlock: 37 },
          { numBlocks: 1, dataCodewordsPerBlock: 38 }
        ]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 107 }]
      },
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [
          { numBlocks: 12, dataCodewordsPerBlock: 11 },
          { numBlocks: 4, dataCodewordsPerBlock: 12 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 8, dataCodewordsPerBlock: 20 },
          { numBlocks: 4, dataCodewordsPerBlock: 21 }
        ]
      }
    ]
  },
  {
    version: 14,
    bits: 0x0e60d,
    alignmentPatternCenters: [6, 26, 46, 66],
    ecLevels: [
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 40 },
          { numBlocks: 5, dataCodewordsPerBlock: 41 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 115 },
          { numBlocks: 1, dataCodewordsPerBlock: 116 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 11, dataCodewordsPerBlock: 12 },
          { numBlocks: 5, dataCodewordsPerBlock: 13 }
        ]
      },
      {
        ecCodewordsPerBlock: 20,
        ecBlocks: [
          { numBlocks: 11, dataCodewordsPerBlock: 16 },
          { numBlocks: 5, dataCodewordsPerBlock: 17 }
        ]
      }
    ]
  },
  {
    version: 15,
    bits: 0x0f928,
    alignmentPatternCenters: [6, 26, 48, 70],
    ecLevels: [
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 5, dataCodewordsPerBlock: 41 },
          { numBlocks: 5, dataCodewordsPerBlock: 42 }
        ]
      },
      {
        ecCodewordsPerBlock: 22,
        ecBlocks: [
          { numBlocks: 5, dataCodewordsPerBlock: 87 },
          { numBlocks: 1, dataCodewordsPerBlock: 88 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 11, dataCodewordsPerBlock: 12 },
          { numBlocks: 7, dataCodewordsPerBlock: 13 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 5, dataCodewordsPerBlock: 24 },
          { numBlocks: 7, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 16,
    bits: 0x10b78,
    alignmentPatternCenters: [6, 26, 50, 74],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 7, dataCodewordsPerBlock: 45 },
          { numBlocks: 3, dataCodewordsPerBlock: 46 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 5, dataCodewordsPerBlock: 98 },
          { numBlocks: 1, dataCodewordsPerBlock: 99 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 15 },
          { numBlocks: 13, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [
          { numBlocks: 15, dataCodewordsPerBlock: 19 },
          { numBlocks: 2, dataCodewordsPerBlock: 20 }
        ]
      }
    ]
  },
  {
    version: 17,
    bits: 0x1145d,
    alignmentPatternCenters: [6, 30, 54, 78],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 10, dataCodewordsPerBlock: 46 },
          { numBlocks: 1, dataCodewordsPerBlock: 47 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 1, dataCodewordsPerBlock: 107 },
          { numBlocks: 5, dataCodewordsPerBlock: 108 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 14 },
          { numBlocks: 17, dataCodewordsPerBlock: 15 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 1, dataCodewordsPerBlock: 22 },
          { numBlocks: 15, dataCodewordsPerBlock: 23 }
        ]
      }
    ]
  },
  {
    version: 18,
    bits: 0x12a17,
    alignmentPatternCenters: [6, 30, 56, 82],
    ecLevels: [
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 9, dataCodewordsPerBlock: 43 },
          { numBlocks: 4, dataCodewordsPerBlock: 44 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 5, dataCodewordsPerBlock: 120 },
          { numBlocks: 1, dataCodewordsPerBlock: 121 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 14 },
          { numBlocks: 19, dataCodewordsPerBlock: 15 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 17, dataCodewordsPerBlock: 22 },
          { numBlocks: 1, dataCodewordsPerBlock: 23 }
        ]
      }
    ]
  },
  {
    version: 19,
    bits: 0x13532,
    alignmentPatternCenters: [6, 30, 58, 86],
    ecLevels: [
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 44 },
          { numBlocks: 11, dataCodewordsPerBlock: 45 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 113 },
          { numBlocks: 4, dataCodewordsPerBlock: 114 }
        ]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 9, dataCodewordsPerBlock: 13 },
          { numBlocks: 16, dataCodewordsPerBlock: 14 }
        ]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 17, dataCodewordsPerBlock: 21 },
          { numBlocks: 4, dataCodewordsPerBlock: 22 }
        ]
      }
    ]
  },
  {
    version: 20,
    bits: 0x149a6,
    alignmentPatternCenters: [6, 34, 62, 90],
    ecLevels: [
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 41 },
          { numBlocks: 13, dataCodewordsPerBlock: 42 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 107 },
          { numBlocks: 5, dataCodewordsPerBlock: 108 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 15, dataCodewordsPerBlock: 15 },
          { numBlocks: 10, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 15, dataCodewordsPerBlock: 24 },
          { numBlocks: 5, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 21,
    bits: 0x15683,
    alignmentPatternCenters: [6, 28, 50, 72, 94],
    ecLevels: [
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 42 }]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 116 },
          { numBlocks: 4, dataCodewordsPerBlock: 117 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 19, dataCodewordsPerBlock: 16 },
          { numBlocks: 6, dataCodewordsPerBlock: 17 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 17, dataCodewordsPerBlock: 22 },
          { numBlocks: 6, dataCodewordsPerBlock: 23 }
        ]
      }
    ]
  },
  {
    version: 22,
    bits: 0x168c9,
    alignmentPatternCenters: [6, 26, 50, 74, 98],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 46 }]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 111 },
          { numBlocks: 7, dataCodewordsPerBlock: 112 }
        ]
      },
      {
        ecCodewordsPerBlock: 24,
        ecBlocks: [{ numBlocks: 34, dataCodewordsPerBlock: 13 }]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 7, dataCodewordsPerBlock: 24 },
          { numBlocks: 16, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 23,
    bits: 0x177ec,
    alignmentPatternCenters: [6, 30, 54, 74, 102],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 47 },
          { numBlocks: 14, dataCodewordsPerBlock: 48 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 121 },
          { numBlocks: 5, dataCodewordsPerBlock: 122 }
        ]
      },

      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 16, dataCodewordsPerBlock: 15 },
          { numBlocks: 14, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 11, dataCodewordsPerBlock: 24 },
          { numBlocks: 14, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 24,
    bits: 0x18ec4,
    alignmentPatternCenters: [6, 28, 54, 80, 106],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 6, dataCodewordsPerBlock: 45 },
          { numBlocks: 14, dataCodewordsPerBlock: 46 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 6, dataCodewordsPerBlock: 117 },
          { numBlocks: 4, dataCodewordsPerBlock: 118 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 30, dataCodewordsPerBlock: 16 },
          { numBlocks: 2, dataCodewordsPerBlock: 17 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 11, dataCodewordsPerBlock: 24 },
          { numBlocks: 16, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 25,
    bits: 0x191e1,
    alignmentPatternCenters: [6, 32, 58, 84, 110],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 8, dataCodewordsPerBlock: 47 },
          { numBlocks: 13, dataCodewordsPerBlock: 48 }
        ]
      },
      {
        ecCodewordsPerBlock: 26,
        ecBlocks: [
          { numBlocks: 8, dataCodewordsPerBlock: 106 },
          { numBlocks: 4, dataCodewordsPerBlock: 107 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 22, dataCodewordsPerBlock: 15 },
          { numBlocks: 13, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 7, dataCodewordsPerBlock: 24 },
          { numBlocks: 22, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 26,
    bits: 0x1afab,
    alignmentPatternCenters: [6, 30, 58, 86, 114],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 19, dataCodewordsPerBlock: 46 },
          { numBlocks: 4, dataCodewordsPerBlock: 47 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 10, dataCodewordsPerBlock: 114 },
          { numBlocks: 2, dataCodewordsPerBlock: 115 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 33, dataCodewordsPerBlock: 16 },
          { numBlocks: 4, dataCodewordsPerBlock: 17 }
        ]
      },
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 28, dataCodewordsPerBlock: 22 },
          { numBlocks: 6, dataCodewordsPerBlock: 23 }
        ]
      }
    ]
  },
  {
    version: 27,
    bits: 0x1b08e,
    alignmentPatternCenters: [6, 34, 62, 90, 118],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 22, dataCodewordsPerBlock: 45 },
          { numBlocks: 3, dataCodewordsPerBlock: 46 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 8, dataCodewordsPerBlock: 122 },
          { numBlocks: 4, dataCodewordsPerBlock: 123 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 12, dataCodewordsPerBlock: 15 },
          { numBlocks: 28, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 8, dataCodewordsPerBlock: 23 },
          { numBlocks: 26, dataCodewordsPerBlock: 24 }
        ]
      }
    ]
  },
  {
    version: 28,
    bits: 0x1cc1a,
    alignmentPatternCenters: [6, 26, 50, 74, 98, 122],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 45 },
          { numBlocks: 23, dataCodewordsPerBlock: 46 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 3, dataCodewordsPerBlock: 117 },
          { numBlocks: 10, dataCodewordsPerBlock: 118 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 11, dataCodewordsPerBlock: 15 },
          { numBlocks: 31, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 24 },
          { numBlocks: 31, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 29,
    bits: 0x1d33f,
    alignmentPatternCenters: [6, 30, 54, 78, 102, 126],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 21, dataCodewordsPerBlock: 45 },
          { numBlocks: 7, dataCodewordsPerBlock: 46 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 7, dataCodewordsPerBlock: 116 },
          { numBlocks: 7, dataCodewordsPerBlock: 117 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 19, dataCodewordsPerBlock: 15 },
          { numBlocks: 26, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 1, dataCodewordsPerBlock: 23 },
          { numBlocks: 37, dataCodewordsPerBlock: 24 }
        ]
      }
    ]
  },
  {
    version: 30,
    bits: 0x1ed75,
    alignmentPatternCenters: [6, 26, 52, 78, 104, 130],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 19, dataCodewordsPerBlock: 47 },
          { numBlocks: 10, dataCodewordsPerBlock: 48 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 5, dataCodewordsPerBlock: 115 },
          { numBlocks: 10, dataCodewordsPerBlock: 116 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 23, dataCodewordsPerBlock: 15 },
          { numBlocks: 25, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 15, dataCodewordsPerBlock: 24 },
          { numBlocks: 25, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 31,
    bits: 0x1f250,
    alignmentPatternCenters: [6, 30, 56, 82, 108, 134],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 46 },
          { numBlocks: 29, dataCodewordsPerBlock: 47 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 13, dataCodewordsPerBlock: 115 },
          { numBlocks: 3, dataCodewordsPerBlock: 116 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 23, dataCodewordsPerBlock: 15 },
          { numBlocks: 28, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 42, dataCodewordsPerBlock: 24 },
          { numBlocks: 1, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 32,
    bits: 0x209d5,
    alignmentPatternCenters: [6, 34, 60, 86, 112, 138],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 10, dataCodewordsPerBlock: 46 },
          { numBlocks: 23, dataCodewordsPerBlock: 47 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 115 }]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 19, dataCodewordsPerBlock: 15 },
          { numBlocks: 35, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 10, dataCodewordsPerBlock: 24 },
          { numBlocks: 35, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 33,
    bits: 0x216f0,
    alignmentPatternCenters: [6, 30, 58, 86, 114, 142],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 14, dataCodewordsPerBlock: 46 },
          { numBlocks: 21, dataCodewordsPerBlock: 47 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 17, dataCodewordsPerBlock: 115 },
          { numBlocks: 1, dataCodewordsPerBlock: 116 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 11, dataCodewordsPerBlock: 15 },
          { numBlocks: 46, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 29, dataCodewordsPerBlock: 24 },
          { numBlocks: 19, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 34,
    bits: 0x228ba,
    alignmentPatternCenters: [6, 34, 62, 90, 118, 146],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 14, dataCodewordsPerBlock: 46 },
          { numBlocks: 23, dataCodewordsPerBlock: 47 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 13, dataCodewordsPerBlock: 115 },
          { numBlocks: 6, dataCodewordsPerBlock: 116 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 59, dataCodewordsPerBlock: 16 },
          { numBlocks: 1, dataCodewordsPerBlock: 17 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 44, dataCodewordsPerBlock: 24 },
          { numBlocks: 7, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 35,
    bits: 0x2379f,
    alignmentPatternCenters: [6, 30, 54, 78, 102, 126, 150],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 12, dataCodewordsPerBlock: 47 },
          { numBlocks: 26, dataCodewordsPerBlock: 48 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 12, dataCodewordsPerBlock: 121 },
          { numBlocks: 7, dataCodewordsPerBlock: 122 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 22, dataCodewordsPerBlock: 15 },
          { numBlocks: 41, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 39, dataCodewordsPerBlock: 24 },
          { numBlocks: 14, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 36,
    bits: 0x24b0b,
    alignmentPatternCenters: [6, 24, 50, 76, 102, 128, 154],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 6, dataCodewordsPerBlock: 47 },
          { numBlocks: 34, dataCodewordsPerBlock: 48 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 6, dataCodewordsPerBlock: 121 },
          { numBlocks: 14, dataCodewordsPerBlock: 122 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 2, dataCodewordsPerBlock: 15 },
          { numBlocks: 64, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 46, dataCodewordsPerBlock: 24 },
          { numBlocks: 10, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 37,
    bits: 0x2542e,
    alignmentPatternCenters: [6, 28, 54, 80, 106, 132, 158],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 29, dataCodewordsPerBlock: 46 },
          { numBlocks: 14, dataCodewordsPerBlock: 47 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 17, dataCodewordsPerBlock: 122 },
          { numBlocks: 4, dataCodewordsPerBlock: 123 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 24, dataCodewordsPerBlock: 15 },
          { numBlocks: 46, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 49, dataCodewordsPerBlock: 24 },
          { numBlocks: 10, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 38,
    bits: 0x26a64,
    alignmentPatternCenters: [6, 32, 58, 84, 110, 136, 162],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 13, dataCodewordsPerBlock: 46 },
          { numBlocks: 32, dataCodewordsPerBlock: 47 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 4, dataCodewordsPerBlock: 122 },
          { numBlocks: 18, dataCodewordsPerBlock: 123 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 42, dataCodewordsPerBlock: 15 },
          { numBlocks: 32, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 48, dataCodewordsPerBlock: 24 },
          { numBlocks: 14, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 39,
    bits: 0x27541,
    alignmentPatternCenters: [6, 26, 54, 82, 110, 138, 166],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 40, dataCodewordsPerBlock: 47 },
          { numBlocks: 7, dataCodewordsPerBlock: 48 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 20, dataCodewordsPerBlock: 117 },
          { numBlocks: 4, dataCodewordsPerBlock: 118 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 10, dataCodewordsPerBlock: 15 },
          { numBlocks: 67, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 43, dataCodewordsPerBlock: 24 },
          { numBlocks: 22, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  },
  {
    version: 40,
    bits: 0x28c69,
    alignmentPatternCenters: [6, 30, 58, 86, 114, 142, 170],
    ecLevels: [
      {
        ecCodewordsPerBlock: 28,
        ecBlocks: [
          { numBlocks: 18, dataCodewordsPerBlock: 47 },
          { numBlocks: 31, dataCodewordsPerBlock: 48 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 19, dataCodewordsPerBlock: 118 },
          { numBlocks: 6, dataCodewordsPerBlock: 119 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 20, dataCodewordsPerBlock: 15 },
          { numBlocks: 61, dataCodewordsPerBlock: 16 }
        ]
      },
      {
        ecCodewordsPerBlock: 30,
        ecBlocks: [
          { numBlocks: 34, dataCodewordsPerBlock: 24 },
          { numBlocks: 34, dataCodewordsPerBlock: 25 }
        ]
      }
    ]
  }
];
