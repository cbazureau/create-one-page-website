/**
 * Custom posthtml-web-component because :
 * - https://github.com/posthtml/posthtml-web-component/blob/master/src/LinkImport.js is not up to date (to propose an MR)
 * - the return undefined doesn't work
 * - when zero component are present js/css were still loaded
 */
const LinkImport = require('./LinkImport');
const TAGS = ['cow-clock'];

module.exports = function (options) {
  return function webComponent(tree, cb) {
    var LinkImports = [];
    TAGS.forEach(tag => {
      let count = 0;
      tree.match({ tag }, function (node) {
        count++;
        return node;
      });
      if (count > 0) {
        const linkImport = LinkImport.parse(tag);
        LinkImports.push(linkImport);
      }
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
            let props = {};
            if (node.attrs) {
              props = Object.keys(node.attrs).reduce((acc, item) => {
                if (item.startsWith('data-')) {
                  return {
                    ...acc,
                    [item.replace('data-', '')]: node.attrs[item],
                  };
                }
                return acc;
              }, {});
            }
            return currentLinkImport.getHTML(props);
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
