const { Parcel } = require('@parcel/core');
const fs = require('fs-extra');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const { srcFolder, buildFolder, indexFile } = require('./constants');

// Single entrypoint file location:
const entryFiles = resolveApp(`${srcFolder}${indexFile}`);

// Bundler options
const defaultOptions = {
  // mode: 'development',
  // defaultTargetOptions: {
  //   shouldOptimize: false,
  //   shouldScopeHoist: false,
  //   sourceMaps: false,
  //   publicUrl: '/',
  //   distDir: resolveApp(buildFolder),
  //   // engines: Engines,
  //   // outputFormat: OutputFormat,
  //   isLibrary: false,
  // },
};

const getBundler = options => {
  fs.removeSync(resolveApp(buildFolder));
  const bundler = new Parcel({
    entries: entryFiles,
    defaultConfig: 'cow-scripts/config-default.json',
    ...defaultOptions,
    ...options,
  });
  return bundler;
};

module.exports = getBundler;
