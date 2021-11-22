/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
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
// The only job of create-one-page-websiteis to init the repository and then
// forward all the commands to the local version of create-one-page-website.
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
// This file must work on Node 14+.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
//
const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const spawn = require('cross-spawn');
const semver = require('semver');
const os = require('os');
const commander = require('commander');
const packageJson = require('./package.json');

let projectName;

/**
 * getInstallPackage
 * Inspired by https://github.com/facebook/create-react-app
 * @param {*} version
 * @param {*} originalDirectory
 * @returns
 */
const getInstallPackage = (version, originalDirectory) => {
  let packageToInstall = 'cow-scripts';
  const validSemver = semver.valid(version);
  if (validSemver) {
    packageToInstall += `@${validSemver}`;
  } else if (version) {
    if (version[0] === '@' && !version.includes('/')) {
      packageToInstall += version;
    } else if (version.match(/^file:/)) {
      packageToInstall = `file:${path.resolve(
        originalDirectory,
        version.match(/^file:(.*)?$/)[1]
      )}`;
    } else {
      // for tar.gz or alternative paths
      packageToInstall = version;
    }
  }

  return packageToInstall;
};

/**
 * getPackageName
 * @param {*} installPackage
 * @returns
 */
const getPackageName = installPackage => {
  if (installPackage.match(/^file:/)) {
    const installPackagePath = installPackage.match(/^file:(.*)?$/)[1];
    const { name } = require(path.join(installPackagePath, 'package.json'));
    return { name };
  }
  return { name: installPackage };
};

/**
 * getTemplateInstallPackage
 * Inspired by https://github.com/facebook/create-react-app
 * @param {*} template
 * @param {*} originalDirectory
 * @returns
 */
const getTemplateInstallPackage = (template, originalDirectory) => {
  let templateToInstall = 'cow-template';
  if (template) {
    if (template.match(/^file:/)) {
      templateToInstall = `file:${path.resolve(
        originalDirectory,
        template.match(/^file:(.*)?$/)[1]
      )}`;
    } else if (
      template.includes('://') ||
      template.match(/^.+\.(tgz|tar\.gz)$/)
    ) {
      // for tar.gz or alternative paths
      templateToInstall = template;
    } else {
      // Add prefix 'cow-template-' to non-prefixed templates, leaving any
      // @scope/ and @version intact.
      const packageMatch = template.match(/^(@[^/]+\/)?([^@]+)?(@.+)?$/);
      const scope = packageMatch[1] || '';
      const templateName = packageMatch[2] || '';
      const version = packageMatch[3] || '';

      if (
        templateName === templateToInstall ||
        templateName.startsWith(`${templateToInstall}-`)
      ) {
        // Covers:
        // - cow-template
        // - @SCOPE/cow-template
        // - cow-template-NAME
        // - @SCOPE/cow-template-NAME
        templateToInstall = `${scope}${templateName}${version}`;
      } else if (version && !scope && !templateName) {
        // Covers using @SCOPE only
        templateToInstall = `${version}/${templateToInstall}`;
      } else {
        // Covers templates without the `cow-template` prefix:
        // - NAME
        // - @SCOPE/NAME
        templateToInstall = `${scope}${templateToInstall}-${templateName}${version}`;
      }
    }
  }
  return templateToInstall;
};

// If project only contains files generated by GH, it’s safe.
// Also, if project contains remnant error logs from a previous
// installation, lets remove them now.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebook/create-react-app/pull/368#issuecomment-243446094
/**
 * isSafeToCreateProjectIn
 * Iso https://github.com/facebook/create-react-app
 * @param {*} root
 * @param {*} name
 * @returns
 */
function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    '.DS_Store',
    '.git',
    '.gitattributes',
    '.gitignore',
    '.gitlab-ci.yml',
    '.hg',
    '.hgcheck',
    '.hgignore',
    '.idea',
    '.npmignore',
    '.travis.yml',
    'docs',
    'LICENSE',
    'README.md',
    'mkdocs.yml',
    'Thumbs.db',
  ];
  // These files should be allowed to remain on a failed install, but then
  // silently removed during the next create.
  const errorLogFilePatterns = [
    'npm-debug.log',
    'yarn-error.log',
    'yarn-debug.log',
  ];
  const isErrorLog = file =>
    errorLogFilePatterns.some(pattern => file.startsWith(pattern));

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter(file => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter(file => !isErrorLog(file));

  if (conflicts.length > 0) {
    console.log(
      `The directory ${chalk.green(name)} contains files that could conflict:`
    );
    console.log();
    conflicts.forEach(file => {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          console.log(`  ${chalk.blue(`${file}/`)}`);
        } else {
          console.log(`  ${file}`);
        }
      } catch (e) {
        console.log(`  ${file}`);
      }
    });

    console.log();
    console.log(
      'Either try using a new directory name, or remove the files listed above.'
    );

    return false;
  }

  // Remove any log files from a previous installation.
  fs.readdirSync(root).forEach(file => {
    if (isErrorLog(file)) {
      fs.removeSync(path.join(root, file));
    }
  });
  return true;
}

/**
 * executeNodeScript
 * Iso https://github.com/facebook/create-react-app
 * @param {*} param0
 * @param {*} data
 * @param {*} source
 * @returns
 */
const executeNodeScript = ({ cwd, args }, data, source) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [...args, '-e', source, '--', JSON.stringify(data)],
      { cwd, stdio: 'inherit' }
    );

    child.on('close', code => {
      if (code !== 0) {
        reject(
          new Error({
            command: `node ${args.join(' ')}`,
          })
        );
        return;
      }
      resolve();
    });
  });

/**
 * createOnePageWebsite
 * Inspired by https://github.com/facebook/create-react-app
 * @param {*} name
 * @param {*} version
 * @param {*} template
 */
const createOnePageWebsite = (name, version, template) =>
  new Promise((resolve, reject) => {
    const root = path.resolve(name);
    const appName = path.basename(root);

    // checkAppName(appName);
    fs.ensureDirSync(name);
    if (!isSafeToCreateProjectIn(root, name)) {
      process.exit(1);
    }
    console.log();

    console.log(`Creating a new One-page Website in ${chalk.green(root)}.`);
    console.log();
    const defaultPackageJson = {
      name: appName,
      version: '0.1.0',
      private: true,
    };
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify(defaultPackageJson, null, 2) + os.EOL
    );

    const originalDirectory = process.cwd();
    process.chdir(root);

    const packageToInstall = getInstallPackage(version, originalDirectory);
    const templateToInstall = getTemplateInstallPackage(
      template,
      originalDirectory
    );
    const allDependencies = [packageToInstall, templateToInstall];

    console.log('Installing packages. This might take a couple of minutes.');
    const command = 'npm';
    const args = [
      'install',
      '--save',
      '--save-exact',
      '--loglevel',
      'error',
      ...allDependencies,
    ];
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject(
          new Error({
            command: `${command} ${args.join(' ')}`,
          })
        );
        return;
      }
      const packageName = getPackageName(packageToInstall).name;
      const templateName = getPackageName(templateToInstall).name;
      executeNodeScript(
        {
          cwd: process.cwd(),
          args: [],
        },
        [root, appName, originalDirectory, templateName],
        `
      var init = require('${packageName}/scripts/init.js');
      init.apply(null, JSON.parse(process.argv[1]));
    `
      )
        .then(() => resolve())
        .catch(e => reject(e));
    });
  });

/**
 * init
 * Inspired by https://github.com/facebook/create-react-app
 */
const init = () => {
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
      projectName = name;
    })
    .option(
      '--scripts-version <alternative-package>',
      'use a non-standard version of react-scripts'
    )
    .option(
      '--template <path-to-template>',
      'specify a template for the created project'
    )
    .on('--help', () => {
      console.log();
      console.log(
        `    Only ${chalk.green('<project-directory>')} is required.`
      );
      console.log();
      console.log(
        `    A custom ${chalk.cyan('--scripts-version')} can be one of:`
      );
      console.log(`      - a specific npm version: ${chalk.green('0.8.2')}`);
      console.log(`      - a specific npm tag: ${chalk.green('@next')}`);
      console.log(
        `      - a custom fork published on npm: ${chalk.green(
          'my-cow-scripts'
        )}`
      );
      console.log(
        `      - a local path relative to the current working directory: ${chalk.green(
          'file:../my-cow-scripts'
        )}`
      );
      console.log(
        `      - a .tgz archive: ${chalk.green(
          'https://mysite.com/my-cow-scripts-0.8.2.tgz'
        )}`
      );
      console.log(
        `      - a .tar.gz archive: ${chalk.green(
          'https://mysite.com/my-cow-scripts-0.8.2.tar.gz'
        )}`
      );
      console.log(
        `    It is not needed unless you specifically want to use a fork.`
      );
      console.log();
      console.log(`    A custom ${chalk.cyan('--template')} can be one of:`);
      console.log(
        `      - a custom template published on npm: ${chalk.green(
          'cow-template-typescript'
        )}`
      );
      console.log(
        `      - a local path relative to the current working directory: ${chalk.green(
          'file:../my-custom-template'
        )}`
      );
      console.log(
        `      - a .tgz archive: ${chalk.green(
          'https://mysite.com/my-custom-template-0.8.2.tgz'
        )}`
      );
      console.log(
        `      - a .tar.gz archive: ${chalk.green(
          'https://mysite.com/my-custom-template-0.8.2.tar.gz'
        )}`
      );
      console.log();
    })
    .parse(process.argv);

  if (typeof projectName === 'undefined') {
    console.error('Please specify the project directory:');
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    );
    console.log();
    console.log('For example:');
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('my-react-app')}`
    );
    console.log();
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  createOnePageWebsite(
    projectName,
    program.opts().scriptsVersion,
    program.opts().template
  )
    .then(() => {
      console.log('Installation Success');
    })
    .catch(() => {
      console.error('Installation Failed');
      process.exit(1);
    });
};

module.exports = {
  init,
};
