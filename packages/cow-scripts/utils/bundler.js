const Bundler = require('parcel-bundler');
const fs = require('fs-extra');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const {
  srcFolder,
  buildFolder,
  cacheFolder,
  indexFile,
} = require('./constants');

// Single entrypoint file location:
const entryFiles = resolveApp(`${srcFolder}${indexFile}`);

// Bundler options
const defaultOptions = {
  outDir: resolveApp(buildFolder), // The out directory to put the build files in, defaults to dist
  outFile: indexFile, // The name of the outputFile
  publicUrl: '/', // The url to serve on, defaults to '/'
  cache: false, // Enabled or disables caching, defaults to true
  cacheDir: resolveApp(cacheFolder), // The directory cache gets put in, defaults to .cache
  contentHash: false, // Disable content hash from being included on the filename
  global: 'moduleName', // Expose modules as UMD under this name, disabled by default
  minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
  scopeHoist: false, // Turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
  target: 'browser', // Browser/node/electron, defaults to browser
  bundleNodeModules: false, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default
  logLevel: 3, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors, 0 = log nothing
  sourceMaps: false, // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
  detailedReport: false, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
  autoInstall: false, // Enable or disable auto install of missing dependencies found during bundling
};

const getBundler = options => {
  return new Bundler(entryFiles, { ...defaultOptions, ...options });
};

module.exports = getBundler;
