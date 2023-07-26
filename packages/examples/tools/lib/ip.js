/**
 * @module ip
 * @description 获取本机 IP 地址
 */

import os from 'os';

const IPV4_RE = /^\d{1,3}(?:\.\d{1,3}){3}$/;

/**
 * @function resolveIp
 * @param {boolean} ipv4
 * @return {Promise<string>}
 */
export default async (ipv4 = true) => {
  const networkInterfaces = os.networkInterfaces();
  const interfaces = Object.keys(networkInterfaces);

  for (const face of interfaces) {
    const networkInterface = networkInterfaces[face];

    for (const { address, internal } of networkInterface) {
      if (!internal && ipv4 && IPV4_RE.test(address)) {
        return address;
      }
    }
  }

  return ipv6 ? '::1' : '127.0.0.1';
};
