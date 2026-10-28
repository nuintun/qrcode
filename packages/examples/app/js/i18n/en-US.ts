/**
 * @module i18n/en-US
 */

import type zhCN from './zh-CN';

const enUS: typeof zhCN = {
  app: {
    title: 'QRCode'
  },
  common: {
    confirm: 'OK',
    unknownError: 'Unknown error',
    on: 'ON',
    off: 'OFF'
  },
  tabs: {
    encode: 'QR Encode',
    decode: 'QR Decode'
  },
  encode: {
    mode: 'Encoding mode',
    charset: 'Charset',
    version: 'Version',
    level: 'Error correction',
    fnc1: 'FNC1 support',
    fnc1None: 'None',
    aimIndicator: 'AIM indicator',
    moduleSize: 'Module size',
    quietZone: 'Quiet zone',
    quietZoneTip: '4x module size recommended',
    autoCalculate: 'Auto calculate',
    foreground: 'Foreground color',
    background: 'Background color',
    submit: 'Encode'
  },
  decode: {
    result: 'Result {n}',
    locateTitle: 'Locate result {n}',
    detailsTitle: 'Result {n} details',
    overview: 'Overview',
    locate: 'Locate',
    details: 'Details',
    selectImage: 'Select image',
    strict: 'Strict mode',
    strictTip: 'May improve scanning speed but reduce recognition rate',
    invert: 'Invert image',
    submit: 'Decode'
  },
  worker: {
    notFound: 'No QRCode found',
    locateFailed: 'Failed to generate the locate image'
  },
  clipboard: {
    copy: 'Copy',
    copied: 'Copied',
    failed: 'Copy failed'
  },
  error: {
    title: 'Page error',
    retry: 'Retry',
    description: 'Sorry, an error occurred and the page failed to render. Please contact the administrator or retry.'
  },
  imagePicker: {
    invalidType: 'Please select an image file',
    readFailed: 'Failed to read file'
  }
};

export default enUS;
