const fs = require('fs-extra');
const path = require('path');

const cowImage = require(`./components/cow-image/processor`);
const cowVisible = require(`./components/cow-visible/processor`);
const cowInlineSvg = require(`./components/cow-inline-svg/processor`);
const cowManifestFavicon = require(`./components/cow-manifest-favicon/processor`);

const TAGS = [cowImage, cowVisible, cowInlineSvg, cowManifestFavicon];

module.exports = options => (tree, cb) => {
  const importedTags = [];
  TAGS.forEach(({ name, processor }) => {
    let count = 0;
    tree.match({ tag: name }, node => {
      count += 1;
      if (name === 'cow-manifest-favicon') console.log(node);
      return processor(node, options);
    });
    if (count > 0) {
      importedTags.push(name);
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
          // eslint-disable-next-line no-param-reassign
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
          // eslint-disable-next-line no-param-reassign
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
