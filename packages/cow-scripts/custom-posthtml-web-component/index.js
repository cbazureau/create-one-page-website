/**
 * Custom posthtml-web-component because :
 * - https://github.com/posthtml/posthtml-web-component/blob/master/src/LinkImport.js is not up to date (to propose an MR)
 * - the return undefined doesn't work
 * - when zero component are present js/css were still loaded
 */
var LinkImport = require('./LinkImport');

module.exports = function (options) {
  return function webComponent(tree, cb) {
    var LinkImports = [];
    tree.walk(function (node) {
      if (
        node.tag === 'link' &&
        node.attrs.rel === 'import' &&
        node.attrs.href
      ) {
        const linkImport = LinkImport.parse(node, options);
        const tagName = linkImport.getCustomElementTagName();
        let count = 0;
        tree.match({ tag: tagName }, function (node) {
          count++;
          return node;
        });
        if (count > 0) LinkImports.push(linkImport);
        // remove LinkImport from origin html
        return {};
      }
      return node;
    });

    Promise.all(
      LinkImports.map(function (linkImport) {
        return linkImport.load();
      })
    ).then(onAllLoaded, onAllLoaded);

    function onAllLoaded() {
      var resources = {
        styles: [],
        scripts: [],
      };

      LinkImports.filter(function (linkImport) {
        return linkImport.loaded();
      }).reduce(function (resources, currentLinkImport) {
        currentLinkImport.prepare();
        resources.styles.push.apply(
          resources.styles,
          currentLinkImport.getStyles()
        );
        resources.scripts.push.apply(
          resources.scripts,
          currentLinkImport.getScripts()
        );
        tree.match(
          { tag: currentLinkImport.getCustomElementTagName() },
          function (node) {
            return currentLinkImport.getHTML();
          }
        );
        return resources;
      }, resources);

      tree.walk(function (node) {
        if (node && node.tag === 'head') {
          node.content.push.apply(node.content, resources.styles);
        }
        if (node && node.tag === 'body') {
          node.content.push.apply(node.content, resources.scripts);
        }
        return node;
      });
      cb(null, tree);
    }
  };
};
