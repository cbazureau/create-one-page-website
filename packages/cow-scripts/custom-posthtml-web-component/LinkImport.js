const path = require('path');
const posthtml = require('posthtml');
const fs = require('fs');

function LinkImport(customElementTagName, cmpPath) {
  this.customElementTagName = customElementTagName;
  this.cmpPath = cmpPath;
}

LinkImport.prototype.load = function () {
  return new Promise(
    function (resolve, reject) {
      fs.readFile(
        this.cmpPath,
        'utf-8',
        function (error, data) {
          if (error) {
            reject(error);
          } else {
            this.source = data;
            resolve('loaded');
          }
        }.bind(this)
      );
    }.bind(this)
  );
};

LinkImport.prototype.prepare = function () {
  const parts = (this.parts = {
    styles: [],
    scripts: [],
    html: null,
  });
  posthtml()
    .use(
      function (tree) {
        tree.walk(function (node) {
          if (node.tag === 'script') {
            parts.scripts.push(node);
            // remove script node from template
            return undefined;
          } else if (
            node.tag === 'style' ||
            (node.tag === 'link' && node.attrs.rel === 'stylesheet')
          ) {
            parts.styles.push(node);
            // remove style node from template
            return undefined;
          } else if (node.tag === 'template') {
            // if LinkImport has an template tag, use it's innerHTML as custom element's html
            parts.html = node.content;
          }
          return node;
        });
        // if no template tag, use itself as custom element's html
        this.parts.html || (this.parts.html = tree);

        // https://github.com/posthtml/posthtml-render/pull/2
        this.parts.html = {
          tag: 'div',
          attrs: {
            class: this.getCustomElementTagName(),
          },
          content: this.parts.html,
        };
      }.bind(this)
    )
    .process(this.source, { sync: true });
};
LinkImport.parse = function (componentName) {
  const cmpPath = path.resolve(__dirname, `components/${componentName}.html`);
  const customElementTagName = componentName;
  return new LinkImport(customElementTagName, cmpPath);
};

LinkImport.prototype.loaded = function () {
  return !!this.source;
};

LinkImport.prototype.getCustomElementTagName = function () {
  return this.customElementTagName;
};

LinkImport.prototype.getStyles = function () {
  return this.parts.styles;
};

LinkImport.prototype.getScripts = function () {
  return this.parts.scripts;
};

LinkImport.prototype.getHTML = function () {
  return this.parts.html;
};

module.exports = LinkImport;
