const fs = require('fs-extra');
const { getBundler, resolveApp } = require('../utils/bundler');
const {
  postHtmlConfigFile,
  srcFolder,
  buildFolder,
} = require('../utils/constants');
// eslint-disable-next-line import/no-dynamic-require
const postHtmlConfig = require(resolveApp(postHtmlConfigFile));

// set NODE_ENV in production mode
process.env.NODE_ENV = 'production';

const options = {
  mode: 'production',
  defaultTargetOptions: {
    publicUrl: postHtmlConfig?.publicUrl || '/',
  },
};

(async () => {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = getBundler(options);
  try {
    const { bundleGraph, buildTime } = await bundler.run();
    (postHtmlConfig?.extraFilesToCopy || []).forEach(file => {
      const origin = `${srcFolder}${file}`;
      if (fs.existsSync(origin)) {
        fs.copySync(resolveApp(origin), resolveApp(`${buildFolder}${file}`));
        console.log(`Copy ${file} to build folder`);
      }
    });
    const bundles = bundleGraph.getBundles();
    console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
  } catch (e) {
    console.log(e.diagnostics[0]);
  }

  process.exit(0);
})();
