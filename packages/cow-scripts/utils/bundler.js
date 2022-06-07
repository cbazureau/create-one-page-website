const { Parcel } = require('@parcel/core');
const child = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { srcFolder, buildFolder, indexFile } = require('./constants');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

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

const stdout = child.execSync('npm ls --json');
const isLocal =
  JSON.parse(stdout)?.dependencies?.['cow-scripts']?.resolved?.startsWith(
    'file:'
  );

const getBundler = options => {
  fs.removeSync(resolveApp(buildFolder));
  const bundler = new Parcel({
    entries: entryFiles,
    defaultConfig: isLocal
      ? 'cow-scripts/config-default.json'
      : '@parcel/config-default',
    ...defaultOptions,
    ...options,
  });
  return bundler;
};

module.exports = {
  getBundler,
  resolveApp,
};
