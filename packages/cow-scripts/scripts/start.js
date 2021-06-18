const getBundler = require('../utils/bundler');

// Bundler options
const options = {
  watch: true,
  hmr: true,
  sourceMaps: true,
};

(async function () {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = getBundler();

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  const bundle = await bundler.serve();
})();
