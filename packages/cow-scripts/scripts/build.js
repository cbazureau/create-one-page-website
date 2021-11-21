const getBundler = require('../utils/bundler');

const options = {
  mode: 'production',
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
