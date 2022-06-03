const fs = require('fs-extra');
const path = require('path');
const { tmpFolder: TMP } = require('../../../utils/constants');

module.exports = {
  name: 'cow-serviceworker',
  processor: (node, { workingDir }) => {
    fs.ensureDir(path.join(workingDir, TMP));
    const swPath = `../${TMP}/service-worker.js`;

    fs.copySync(
      path.join(__dirname, 'service-worker.js'),
      path.join(workingDir, TMP, 'service-worker.js')
    );
    const script = `navigator.serviceWorker.register(new URL('${swPath}', import.meta.url),{ type: 'module' });`;
    return {
      tag: 'script',
      attrs: { type: 'module' },
      content: [script],
    };
  },
};
