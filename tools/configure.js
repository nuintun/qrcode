/**
 * @module configure
 * @license MIT
 * @author nuintun
 */

import { simple } from 'acorn-walk';
import MagicString from 'magic-string';
import typescript from 'rollup-plugin-typescript2';

const NodeType = {
  Literal: 'Literal',
  Identifier: 'Identifier',
  CallExpresssion: 'CallExpression',
  ImportDeclaration: 'ImportDeclaration',
  ExportAllDeclaration: 'ExportAllDeclaration',
  ExportNamedDeclaration: 'ExportNamedDeclaration'
};

function isEmpty(array) {
  return !array || array.length === 0;
}

function getRequireSource(node) {
  if (node.type !== NodeType.CallExpresssion) {
    return false;
  }

  if (node.callee.type !== NodeType.Identifier || isEmpty(node.arguments)) {
    return false;
  }

  const args = node.arguments;

  if (node.callee.name !== 'require' || args[0].type !== NodeType.Literal) {
    return false;
  }

  return args[0];
}

function getImportSource(node) {
  if (node.type !== NodeType.ImportDeclaration || node.source.type !== NodeType.Literal) {
    return false;
  }

  return node.source;
}

function getExportSource(node) {
  const exportNodes = [NodeType.ExportAllDeclaration, NodeType.ExportNamedDeclaration];

  if (!exportNodes.includes(node.type) || !node.source || node.source.type !== NodeType.Literal) {
    return false;
  }

  return node.source;
}

function rewrite(value, ext = '.js') {
  const rule = /\.ts$/i;

  if (rule.test(value)) {
    return value.replace(rule, ext);
  }

  return value;
}

function extract(node, code) {
  let source;

  switch (node.type) {
    case NodeType.CallExpresssion:
      source = getRequireSource(node);
      break;
    case NodeType.ImportDeclaration:
      source = getImportSource(node);
      break;
    case NodeType.ExportAllDeclaration:
    case NodeType.ExportNamedDeclaration:
      source = getExportSource(node);
      break;
  }

  if (source && /\.ts$/i.test(source.value)) {
    code.overwrite(source.start, source.end, `'${rewrite(source.value, '')}'`);
  }
}

function treeShake() {
  return {
    name: 'rollup-plugin-tree-shake',
    generateBundle(options, bundle) {
      const files = Object.values(bundle);

      for (const file of files) {
        if (!file.isAsset) {
          const code = new MagicString(file.code);
          const ast = this.parse(file.code, {
            sourceType: 'module',
            onComment(block, text, start, end) {
              if (block && text === '* @class ') {
                code.overwrite(start, end, '/*#__PURE__*/');
              }
            }
          });

          file.fileName = rewrite(file.fileName);
          file.imports.map(imported => rewrite(imported));
          file.facadeModuleId = rewrite(file.facadeModuleId);

          const walk = node => extract(node, code);

          simple(ast, {
            CallExpression: walk,
            ImportDeclaration: walk,
            ExportAllDeclaration: walk,
            ExportNamedDeclaration: walk
          });

          file.code = code.toString();
        }
      }
    }
  };
}

export default function configure(esnext) {
  let tsconfigOverride = esnext && { compilerOptions: { declaration: true, declarationDir: 'typings' } };

  return {
    external: ['tslib'],
    input: 'src/index.ts',
    preserveModules: true,
    output: { format: esnext ? 'esm' : 'cjs', dir: esnext ? 'esnext' : 'es5' },
    plugins: [typescript({ tsconfigOverride, clean: true, useTsconfigDeclarationDir: true }), treeShake()],
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    }
  };
}
