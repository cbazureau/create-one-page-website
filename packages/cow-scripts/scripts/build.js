const Bundler = require('parcel-bundler');
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const getHash = value => md5(value);

const originalJsPath = 'js/main.js';
const bundleJsPath = 'js/bundle.[hash].js';
const srcFolder = 'src/';
const buildFolder = 'dist/';
const indexFile = 'index.html';

// Single entrypoint file location:
const entryFiles = resolveApp(`${srcFolder}${indexFile}`);

// Bundler options
const options = {
  outDir: resolveApp(buildFolder), // The out directory to put the build files in, defaults to dist
  outFile: 'index.html', // The name of the outputFile
  publicUrl: '/', // The url to serve on, defaults to '/'
  watch: false, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
  cache: true, // Enabled or disables caching, defaults to true
  cacheDir: resolveApp('.cache'), // The directory cache gets put in, defaults to .cache
  contentHash: false, // Disable content hash from being included on the filename
  global: 'moduleName', // Expose modules as UMD under this name, disabled by default
  minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
  scopeHoist: false, // Turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
  target: 'browser', // Browser/node/electron, defaults to browser
  bundleNodeModules: false, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default
  logLevel: 3, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors, 0 = log nothing
  hmr: false, // Enable or disable HMR while watching
  hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
  sourceMaps: false, // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
  hmrHostname: '', // A hostname for hot module reload, default to ''
  detailedReport: false, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
  autoInstall: false, // Enable or disable auto install of missing dependencies found during bundling
};

(async function () {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = new Bundler(entryFiles, options);

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  const bundle = await bundler.bundle();
})();

// // see below for details on the options
// const inputOptions = {
//   input: `${srcFolder}${originalJsPath}`,
// };
// const outputOptions = [
//   {
//     file: `${buildFolder}${bundleJsPath}`,
//     format: 'cjs',
//     plugins: [
//       css({ output: `${buildFolder}css/main.css` }),
//       terser(),
//       copy({
//         targets: [{ src: 'src/img/**/*', dest: 'build/img' }],
//         hook: 'writeBundle',
//       }),
//     ],
//   },
// ];

// async function build() {
//   fs.emptyDirSync(resolveApp(buildFolder));
//   // create a bundle
//   const bundle = await rollup.rollup(inputOptions);
//   const { output } = await bundle.generate(outputOptions[0]);

//   const html = fs.readFileSync(resolveApp(`${srcFolder}${indexFile}`), 'utf8');
//   const bundlePath = bundleJsPath.replace('[hash]', getHash(output[0].code));
//   const htmlPath = resolveApp(`${buildFolder}${indexFile}`);

//   // Generate BundleJS
//   fs.outputFile(
//     resolveApp(`${buildFolder}${bundlePath}`),
//     output[0].code,
//     'utf8'
//   );

//   // Generate HTML
//   fs.outputFile(htmlPath, html.replace(originalJsPath, bundlePath), 'utf8');

//   // closes the bundle
//   await bundle.close();
// }

// build();
