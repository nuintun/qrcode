/*
 * Copyright 2009 ZXing authors
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

/**
 * These are a set of hints that you may pass to Writers to specify their behavior.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 */
enum EncodeHintType {
  /**
   * Specifies what degree of error correction to use, for example in QR Codes.
   * Type depends on the encoder. For example for QR codes it's type
   * {@link com.google.zxing.qrcode.decoder.ErrorCorrectionLevel ErrorCorrectionLevel}.
   * For Aztec it is of type {@link Integer}, representing the minimal percentage of error correction words.
   * For PDF417 it is of type {@link Integer}, valid values being 0 to 8.
   * In all cases, it can also be a {@link String} representation of the desired value as well.
   * Note: an Aztec symbol should have a minimum of 25% EC words.
   */
  ERROR_CORRECTION,

  /**
   * Specifies what character encoding to use where applicable (type {@link String})
   */
  CHARACTER_SET,

  /**
   * Specifies margin, in pixels, to use when generating the barcode. The meaning can vary
   * by format; for example it controls margin before and after the barcode horizontally for
   * most 1D formats. (Type {@link Integer}, or {@link String} representation of the integer value).
   */
  MARGIN,

  /**
   * Specifies the exact version of QR code to be encoded.
   * (Type {@link Integer}, or {@link String} representation of the integer value).
   */
  QR_VERSION
}

export default EncodeHintType;
