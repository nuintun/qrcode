const fs = require('fs');
const { parse } = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');
const { default: generate } = require('@babel/generator');

function read(src, callback) {
  fs.readdir(src, { withFileTypes: true }, (error, files) => {
    if (!error) {
      files.forEach(file => {
        const path = `${src}/${file.name}`;

        if (file.isDirectory()) {
          read(path, callback);
        } else if (file.isFile() && /\.js$/i.test(file.name)) {
          callback(path);
        }
      });
    }
  });
}

const src = process.argv[2];

if (src === 'es5' || src === 'esnext') {
  read(src, src => {
    fs.readFile(src, (error, buffer) => {
      if (error) {
        console.error(`fixed tree-shaking fail in file: ${src}`);
      } else {
        const ast = parse(buffer.toString(), { sourceType: 'module' });

        traverse(ast, {
          CallExpression(path) {
            if (Array.isArray(path.node.leadingComments)) {
              path.node.leadingComments.forEach(node => {
                if (node.value === '* @class ') {
                  node.value = '#__PURE__';
                }
              });
            }
          }
        });

        const { code } = generate(ast, { retainLines: true });

        fs.writeFile(src, code, error => {
          if (error) {
            console.error(`fixed tree-shaking fail in file: ${src}`);
          }
        });
      }
    });
  });
}
