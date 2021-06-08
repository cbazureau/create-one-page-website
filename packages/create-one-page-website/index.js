#!/usr/bin/env node

/**
 * Copyright (c) 2021-present, Cédric Bazureau.
 * Mostly inspired by https://github.com/facebook/create-react-app
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// create-one-page-website can be installed globally on people's computers. This means
// that it is extremely difficult to have them upgrade the version and
// because there's only one global version installed, it is very prone to
// breaking changes.
//
// The only job of create-one-page-website is to init the repository and then
// forward all the commands to the local version of create-one-page-website
//
// If you need to add a new command, please add it to the scripts/ folder.
//
// The only reason to modify this file is to add more warnings and
// troubleshooting information for the `create-one-page-website` command.
//
// Do not make breaking changes! We absolutely don't want to have to
// tell people to update their global version of create-one-page-website.
//
// Also be careful with new language features.
// This file must work on Node 0.10+.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

'use strict';

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split('.');
var major = semver[0];

if (major < 14) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Create One-page Website requires Node 14 or higher. \n' +
      'Please update your version of Node.'
  );
  process.exit(1);
}

const { init } = require('./createOnePageWebsite');

init();
