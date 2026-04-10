/**
 * @module fs
 * @description 文件系统工具模块，提供文件扫描和遍历功能
 */

import { Dirent, Stats } from 'node:fs';
import { join, resolve } from 'node:path';
import { lstat, readdir, realpath } from 'node:fs/promises';

/**
 * @interface Filter
 * @description 文件过滤器接口，用于过滤需要处理的文件
 */
export interface Filter {
  /**
   * @param path 文件的完整路径
   * @returns 返回 true 表示保留该文件，false 表示过滤掉
   */
  (path: string): boolean;
}

/**
 * @interface ReadEntry
 * @description 目录条目信息接口，包含文件和目录的元数据
 */
interface ReadEntry {
  /**
   * @property name
   * @description 文件或目录的名称
   */
  name: string;
  /**
   * @property path
   * @description 文件或目录的完整路径
   */
  path: string;
  /**
   * @property source
   * @description 文件源路径，对于符号链接则是其指向的真实路径
   */
  source: string;
  /**
   * @property stat
   * @description 文件或目录的状态信息（Dirent 或 Stats 对象）
   */
  stat: Dirent | Stats;
}

/**
 * @typedef Waiting
 * @description 等待处理的目录任务元组类型
 */
type Waiting = [
  // 根目录路径前缀
  root: string,
  // 异步迭代器，用于遍历目录内容
  iterator: AsyncGenerator<ReadEntry>
];

/**
 * @constant DEFAULT_FILTER
 * @description 默认的文件过滤器，接受所有文件
 */
const DEFAULT_FILTER: Filter = () => true;

/**
 * @function read
 * @description 异步生成器函数，读取指定目录下的所有条目（文件和子目录）
 * @param root 要读取的目录路径
 */
async function* read(root: string): AsyncGenerator<ReadEntry> {
  // 读取目录内容，包含文件类型信息
  const dirents = await readdir(root, {
    withFileTypes: true
  });

  // 存储所有条目的处理任务
  const entries: Promise<ReadEntry>[] = [];

  // 为每个目录条目创建处理任务
  for (const dirent of dirents) {
    const runTask = async () => {
      const { name } = dirent;
      const path = join(root, name);

      let source = path;
      let stat: Dirent | Stats = dirent;

      // 处理符号链接：解析真实路径并获取真实文件状态
      if (dirent.isSymbolicLink()) {
        source = await realpath(path);
        stat = await lstat(source);
      }

      return { name, path, source, stat };
    };

    entries.push(runTask());
  }

  // 并行处理所有条目，即使部分失败也不会中断
  const results = await Promise.allSettled(entries);

  // 只产出成功处理的条目
  for (const result of results) {
    if (result.status === 'fulfilled') {
      yield result.value;
    }
  }
}

/**
 * @function scanFiles
 * @description 递归扫描目录，收集所有符合条件的文件路径
 * @param root 要扫描的根目录路径
 * @param filter 可选的文件过滤器函数，默认为接受所有文件
 */
export async function scanFiles(root: string, filter: Filter = DEFAULT_FILTER): Promise<string[]> {
  // 解析为绝对路径
  root = resolve(root);

  // 存储找到的文件路径
  const files: string[] = [];
  // 待处理的目录任务队列
  const waiting: Waiting[] = [];
  // 已访问的路径集合，防止循环引用（特别是符号链接）
  const visited = new Set<string>([await realpath(root)]);

  // 当前正在处理的目录任务
  let current: Waiting | undefined = [``, await read(root)];

  // 使用 BFS（广度优先搜索）遍历目录树
  while (current) {
    const [, iterator] = current;
    const result = await iterator.next();

    if (result.done) {
      // 当前目录遍历完成，从队列中取出下一个待处理目录
      current = waiting.pop();
    } else {
      const entry = result.value;

      // 检查是否已访问过该路径（避免循环引用）
      if (!visited.has(entry.source)) {
        visited.add(entry.source);

        const [root] = current;
        const { stat } = entry;
        const path = `${root}${entry.name}`;

        // 如果是文件且通过过滤器，则添加到结果列表
        if (stat.isFile() && filter(path)) {
          files.push(entry.path);
        } else if (stat.isDirectory()) {
          // 如果是目录，则添加到待处理队列
          waiting.push([`${path}/`, await read(entry.path)]);
        }
      }
    }
  }

  return files;
}
