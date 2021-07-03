const HTMLAsset = require('parcel-bundler/src/assets/HTMLAsset');

class HTMLAssetWithLazySrc extends HTMLAsset {
  collectDependencies() {
    super.collectDependencies();
    this.ast.walk(node => {
      if (node.attrs) {
        // eslint-disable-next-line no-restricted-syntax
        for (const attr in node.attrs) {
          if (attr === 'data-src' || attr === 'data-srcset') {
            // eslint-disable-next-line no-param-reassign
            node.attrs[attr] = super.collectSrcSetDependencies(
              node.attrs[attr]
            );
            this.isAstDirty = true;
            // eslint-disable-next-line no-continue
            continue;
          }
        }
      }

      return node;
    });
  }
}

module.exports = HTMLAssetWithLazySrc;
