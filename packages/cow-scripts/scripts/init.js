/**
 * Copyright (c) 2021-present, Cédric Bazureau.
 * Mostly inspired by https://github.com/facebook/create-react-app
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const spawn = require('cross-spawn');

module.exports = (appPath, appName, originalDirectory, templateName) => {
  const command = 'npm';
  const appPackage = require(path.join(appPath, 'package.json'));
  const templatePath = path.dirname(
    require.resolve(`${templateName}/package.json`, { paths: [appPath] })
  );
  // Copy the files for the user
  const templateDir = path.join(templatePath, 'template');
  if (fs.existsSync(templateDir)) {
    fs.copySync(templateDir, appPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templateDir)}`
    );
    return;
  }

  const templateJsonPath = path.join(templatePath, 'template.json');

  let templateJson = {};
  if (fs.existsSync(templateJsonPath)) {
    templateJson = require(templateJsonPath);
  }

  const templatePackage = templateJson.package || {};

  if (templateJson.dependencies) {
    templatePackage.dependencies = templateJson.dependencies;
  }
  if (templateJson.scripts) {
    templatePackage.scripts = templateJson.scripts;
  }

  // Keys to ignore in templatePackage
  const templatePackageBlacklist = [
    'name',
    'version',
    'description',
    'keywords',
    'bugs',
    'license',
    'author',
    'contributors',
    'files',
    'browser',
    'bin',
    'man',
    'directories',
    'repository',
    'peerDependencies',
    'bundledDependencies',
    'optionalDependencies',
    'engineStrict',
    'os',
    'cpu',
    'preferGlobal',
    'private',
    'publishConfig',
  ];

  // Keys from templatePackage that will be merged with appPackage
  const templatePackageToMerge = ['dependencies', 'scripts'];

  // Keys from templatePackage that will be added to appPackage,
  // replacing any existing entries.
  const templatePackageToReplace = Object.keys(templatePackage).filter(key => {
    return (
      !templatePackageBlacklist.includes(key) &&
      !templatePackageToMerge.includes(key)
    );
  });

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};

  // Setup the script rules
  const templateScripts = templatePackage.scripts || {};
  appPackage.scripts = Object.assign(
    {
      start: 'cow-scripts start',
      build: 'cow-scripts build',
      test: 'cow-scripts test',
      eject: 'cow-scripts eject',
    },
    templateScripts
  );

  // Add templatePackage keys/values to appPackage, replacing existing entries
  templatePackageToReplace.forEach(key => {
    appPackage[key] = templatePackage[key];
  });

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );
  

  // Remove template
  console.log(`Removing template package using ${command}...`);
  console.log();

  const proc = spawn.sync(command, ['uninstall', templateName], {
    stdio: 'inherit',
  });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    return;
  }

};
