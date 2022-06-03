const path = require('path');
const os = require('os');
const sharp = require('sharp');
const fs = require('fs-extra');
const toIco = require('to-ico');
const { tmpFolder: TMP } = require('../../../utils/constants');

function generateFavicon(sourcePath, destPath) {
  const image = fs.readFileSync(sourcePath);

  toIco([image], {
    sizes: [16, 24, 32, 48, 64],
    resize: true,
  }).then(result => {
    fs.writeFileSync(destPath, result);
  });
}

module.exports = {
  name: 'cow-manifest-favicon',
  processor: ({ attrs = {} }, { workingDir, manifest }) => {
    const { src } = attrs;
    const img = path.join(workingDir, './src', src);

    (async () => {
      fs.ensureDir(path.join(workingDir, TMP));
      await sharp(img)
        .resize(192)
        .png({ compressionLevel: 8 })
        .toFile(path.join(workingDir, TMP, 'favicon192x192.png'));
      await sharp(img)
        .resize(512)
        .png({ compressionLevel: 8 })
        .toFile(path.join(workingDir, TMP, 'favicon512x512.png'));
    })();

    generateFavicon(img, path.join(workingDir, TMP, 'favicon.ico'));

    fs.writeFileSync(
      path.join(workingDir, TMP, 'manifest.json'),
      JSON.stringify(
        {
          ...manifest,
          icons: [
            {
              src: `../${TMP}favicon192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: `../${TMP}favicon512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        null,
        2
      ) + os.EOL
    );

    return [
      {
        tag: 'link',
        attrs: {
          href: `../${TMP}manifest.json`,
          rel: 'manifest',
        },
      },
      {
        tag: 'link',
        attrs: {
          href: `../${TMP}favicon.ico`,
          rel: 'shortcut icon',
        },
      },
      {
        tag: 'link',
        attrs: {
          href: `../${TMP}favicon192x192.png`,
          rel: 'icon',
          sizes: '192x192',
        },
      },
      {
        tag: 'link',
        attrs: {
          href: `../${TMP}favicon192x192.png`,
          rel: 'apple-touch-icon',
        },
      },
    ];
  },
};
