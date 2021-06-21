const path = require('path');
const posthtml = require('posthtml');
const render = require('posthtml-render');
const fs = require('fs');
const template = require('lodash/template');

/**
 * @returns a formatted string from the specied object and pattern
 * @param {*} object
 * @param {*} pattern
 */
const formatFromPattern = (pattern, object) =>
  template(pattern, { interpolate: /{([\s\S]+?)}/g })(object);

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
            node.tag = false;
            node.content = [];
            return node;
          } else if (node.tag === 'template') {
            // if LinkImport has an template tag, use it's innerHTML as custom element's html
            parts.html = render(node.content);
          }
          return node;
        });
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

LinkImport.prototype.getHTML = function (props) {
  let html = '';
  posthtml()
    .use(function (tree) {
      html = tree;
    })
    .process(formatFromPattern(this.parts.html, props), { sync: true });
  return html;
};

module.exports = LinkImport;
