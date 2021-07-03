const getBundler = require('../utils/bundler');

const options = {
  minify: true,
  detailedReport: true,
};

(async () => {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = getBundler(options);

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  await bundler.bundle();
  process.exit(0);
})();
