const { getBundler } = require('../utils/bundler');

const PORT = 3000;

// Bundler options
const options = {
  // sourceMaps: true,
  serveOptions: {
    port: PORT,
  },
  hmrOptions: {
    port: PORT,
  },
};

(async () => {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = getBundler(options);

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  await bundler.watch((err, event) => {
    if (err) {
      // fatal error
      throw err;
    }

    if (event.type === 'buildSuccess') {
      const bundles = event.bundleGraph.getBundles();
      console.log(
        `✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`
      );
      console.log(`You can go to http://localhost:${PORT}`);
    } else if (event.type === 'buildFailure') {
      console.log(event.diagnostics);
    }
  });
})();
