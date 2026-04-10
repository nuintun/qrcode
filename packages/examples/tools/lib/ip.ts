/**
 * @module ip
 * @description 获取本机 IP 地址工具模块，支持 IPv4 和 IPv6
 */

import os from 'node:os';

/**
 * @function isLinkLocal
 * @description 判断 IPv6 地址是否为链路本地地址（link-local）
 * @param address 需要验证的 IP 地址字符串
 */
function isLinkLocal(address: string) {
  return /^fe80:/i.test(address);
}

/**
 * @function isIPv4
 * @description 判断协议族是否为 IPv4
 * @param family IP 地址的协议族，可以是字符串（'IPv4'）或数字（4）
 */
function isIPv4(family: string | number) {
  return family === 'IPv4' || family === 4;
}

/**
 * @function isIPv6
 * @description 判断协议族是否为 IPv6
 * @param family IP 地址的协议族，可以是字符串（'IPv6'）或数字（6）
 */
function isIPv6(family: string | number) {
  return family === 'IPv6' || family === 6;
}

/**
 * @function resolveIp
 * @description 获取本机的非回环网络接口 IP 地址
 * @param ipv6 是否返回 IPv6 地址，默认为 false（返回 IPv4）
 */
export default function (ipv6 = false): string {
  // 根据参数选择协议族匹配函数
  const isMatchFamily = ipv6 ? isIPv6 : isIPv4;

  // 获取所有网络接口信息
  const networkInterfaces = os.networkInterfaces();
  const interfaces = Object.keys(networkInterfaces);

  // 遍历所有网络接口
  for (const face of interfaces) {
    const networkInterface = networkInterfaces[face];

    if (networkInterface != null) {
      // 遍历当前接口下的所有地址
      for (const { family, address, internal } of networkInterface) {
        // 检查是否为非内部地址且协议族匹配
        if (!internal && isMatchFamily(family)) {
          // 对于 IPv6，跳过链路本地地址
          if (ipv6 && isLinkLocal(address)) {
            continue;
          }

          // 返回第一个符合条件的地址
          return address;
        }
      }
    }
  }

  // 如果未找到合适的地址，返回本地回环地址作为降级方案
  return ipv6 ? '::1' : '127.0.0.1';
}
