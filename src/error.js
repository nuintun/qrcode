export class QRError extends Error {
  constructor(code, ...args) {
    super(...args);

    this.code = code;
  }
}
