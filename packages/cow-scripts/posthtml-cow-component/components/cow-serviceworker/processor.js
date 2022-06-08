const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const { tmpFolder: TMP } = require('../../../utils/constants');

module.exports = {
  name: 'cow-serviceworker',
  processor: (node, { workingDir }) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(
        `  ${chalk.gray(`[cow-serviceworker] No service worker on dev mode`)}`
      );
      return {
        tag: false,
        attrs: {},
        content: [],
      };
    }
    fs.ensureDir(path.join(workingDir, TMP));
    const swPath = `../${TMP}service-worker.js`;

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
