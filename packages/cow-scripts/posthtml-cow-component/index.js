const fs = require('fs-extra');
const path = require('path');
const TAGS = ['cow-image', 'cow-visible'];

module.exports = options => {
  return (tree, cb) => {
    const importedTags = [];
    TAGS.forEach(tag => {
      let count = 0;
      tree.match({ tag }, function (node) {
        const { processor } = require(`./components/${tag}/processor`);
        count++;
        return processor(node, options);
      });
      if (count > 0) {
        importedTags.push(tag);
      }
    });

    tree.walk(node => {
      if (node && node.tag === 'head') {
        importedTags.forEach(tag => {
          const stylePath = path.resolve(
            __dirname,
            `./components/${tag}/style.css`
          );
          if (fs.existsSync(stylePath)) {
            const style = fs.readFileSync(stylePath, {
              encoding: 'utf8',
              flag: 'r',
            });
            node.content = [
              ...node.content,
              {
                tag: 'style',
                attrs: {},
                content: [style],
              },
            ];
          }
        });
      }
      if (node && node.tag === 'body') {
        importedTags.forEach(tag => {
          const scriptPath = path.resolve(
            __dirname,
            `./components/${tag}/script.js`
          );
          if (fs.existsSync(scriptPath)) {
            const script = fs.readFileSync(scriptPath, {
              encoding: 'utf8',
              flag: 'r',
            });
            node.content = [
              ...node.content,
              {
                tag: 'script',
                attrs: {},
                content: [script],
              },
            ];
          }
        });
      }
      return node;
    });
    cb(null, tree);
  };
};
