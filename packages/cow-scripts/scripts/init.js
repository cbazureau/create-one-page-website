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

module.exports = (appPath, appName, originalDirectory, templateName) => {
  console.log('init', {
    appPath,
    appName,
    originalDirectory,
    templateName,
  });
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
};
