const { getBundler, resolveApp } = require('../utils/bundler');
const { postHtmlConfigFile } = require('../utils/constants');
// eslint-disable-next-line import/no-dynamic-require
const postHtmlConfig = require(resolveApp(postHtmlConfigFile));

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
    const bundles = bundleGraph.getBundles();
    console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
  } catch (e) {
    console.log(e.diagnostics[0]);
  }

  process.exit(0);
})();
