/**
 * @module index
 */

export { Charset } from './common/Charset';
export { Decoder } from './decoder/Decoder';
export { Encoder } from './encoder/Encoder';
export { binarize } from './common/binarize';
export { Byte } from './encoder/segments/Byte';
export { Detector } from './detector/Detector';
export { Hanzi } from './encoder/segments/Hanzi';
export { Kanji } from './encoder/segments/Kanji';
export { Numeric } from './encoder/segments/Numeric';
export { Alphanumeric } from './encoder/segments/Alphanumeric';

// TODO 测试临时导出
export { BitMatrix } from './common/BitMatrix';
export { binarizer } from './common/binarizer';
export { calcTimingPoints } from './detector/utils/matcher';
