const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const RESOLUTIONS = [375, 640, 750, 1024, 1280, 2048, 2560];
const THUMB = 24;
const IMG = '/img/';
const TMP = '/.cow-temp/';

const convertImg = async (img, res, format) => {
  try {
    const metadata = await sharp(img).metadata();
    const target = img.replace(IMG, TMP).replace('.jpg', `.${res}.${format}`);
    if (fs.existsSync(target)) {
      return Promise.resolve();
    } else if (format === 'jpg') {
      await sharp(img).resize(res).toFile(target);
    } else if (format === 'png') {
      await sharp(img).resize(res).png().toFile(target);
    } else {
      await sharp(img).resize(res).webp().toFile(target);
    }
  } catch (e) {
    console.log(e);
  }
};

/**
 * Build srcset
 * @param {*} src
 * @param {*} format
 * @returns
 */
const _buildSrcSet = (src, format) => {
  return RESOLUTIONS.map(
    res =>
      `${src.replace(IMG, TMP).replace('.jpg', `.${res}.${format}`)} ${res}w`
  ).join(', ');
};

module.exports = {
  processor: ({ attrs = {}, content = {} }, { workingDir }) => {
    const { src, alt, sizes, className } = attrs;

    (async () => {
      fs.ensureDir(path.join(workingDir, TMP));
      await RESOLUTIONS.reduce(
        (acc, res) => [...acc, { format: 'jpg', res }, { format: 'webp', res }],
        []
      ).forEach(async ({ format, res }) => {
        await convertImg(path.join(workingDir, './src', src), res, format);
      });
      await convertImg(path.join(workingDir, './src', src), THUMB, 'png');
    })();

    const pictureClassName = ['CowImage', className].filter(c => !!c).join(' ');
    const imgClassName = ['CowImage', className]
      .filter(c => !!c)
      .map(c => `${c}__img`)
      .join(' ');

    return {
      tag: 'picture',
      attrs: {
        class: pictureClassName,
      },
      content: [
        {
          tag: 'source',
          attrs: {
            'data-srcset': _buildSrcSet(src, 'webp'),
            type: 'image/webp',
            sizes: sizes || '100vw',
          },
        },
        {
          tag: 'source',
          attrs: {
            'data-srcset': _buildSrcSet(src, 'jpg'),
            type: 'image/jpeg',
            sizes: sizes || '100vw',
          },
        },
        {
          tag: 'img',
          attrs: {
            class: imgClassName,
            src: src.replace(IMG, TMP).replace('.jpg', `.${THUMB}.png`),
            'data-src': src
              .replace(IMG, TMP)
              .replace('.jpg', `.${RESOLUTIONS[0]}.jpg`),
            alt,
          },
        },
        {
          tag: 'noscript',
          content: [
            {
              tag: 'img',
              attrs: {
                class: imgClassName,
                src: src
                  .replace(IMG, TMP)
                  .replace('.jpg', `.${RESOLUTIONS[0]}.jpg`),
                alt,
              },
            },
          ],
        },
      ],
    };
  },
};
