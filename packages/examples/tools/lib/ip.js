/**
 * @module ip
 * @description 获取本机 IP 地址
 */

import os from 'node:os';

/**
 * @function isLinkLocal
 * @param {string} address
 * @returns {boolean}
 */
function isLinkLocal(address) {
  return /^fe80:/i.test(address);
}

/**
 * @function isIPv4
 * @param {string} family
 * @returns {boolean}
 */
function isIPv4(family) {
  return family === 'IPv4' || family === 4;
}

/**
 * @function isIPv6
 * @param {string} family
 * @returns {boolean}
 */
function isIPv6(family) {
  return family === 'IPv6' || family === 6;
}

/**
 * @function resolveIp
 * @param {boolean} ipv6
 * @return {string}
 */
export default (ipv6 = false) => {
  const isMatchFamily = ipv6 ? isIPv6 : isIPv4;
  const networkInterfaces = os.networkInterfaces();
  const interfaces = Object.keys(networkInterfaces);

  for (const face of interfaces) {
    const networkInterface = networkInterfaces[face];

    for (const { family, address, internal } of networkInterface) {
      if (!internal && isMatchFamily(family)) {
        if (ipv6 && isLinkLocal(address)) {
          continue;
        }

        return address;
      }
    }
  }

  return ipv6 ? '::1' : '127.0.0.1';
};
