const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');

const RESOLUTIONS = [
  { width: 375, quality: 80 },
  { width: 640, quality: 80 },
  { width: 750, quality: 80 },
  { width: 1024, quality: 80 },
  { width: 1280, quality: 80 },
  { width: 2048, quality: 80 },
  { width: 2560, quality: 80 },
];
const THUMB = { width: 24, quality: 60 };
const IMG = '/img/';
const TMP = '/.cow-temp/';
const BLANK_IMG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAQAAACRI2S5AAAAEElEQVR42mNkIAAYRxWAAQAG9gAKqv6+AwAAAABJRU5ErkJggg==';

/**
 * convertImg
 * @param {*} img
 * @param {*} res
 * @param {*} format
 * @returns
 */
const convertImg = async (img, res = {}, format) => {
  const { width, quality } = res;
  try {
    const target = img.replace(IMG, TMP).replace('.jpg', `.${width}.${format}`);
    if (fs.existsSync(target)) {
      return Promise.resolve();
    }
    if (format === 'jpg') {
      return sharp(img).resize(width).jpeg({ quality }).toFile(target);
    }
    if (format === 'png') {
      return sharp(img)
        .resize(width)
        .png({ compressionLevel: Math.round(quality / 10) })
        .toFile(target);
    }
    return sharp(img).resize(width).webp({ quality }).toFile(target);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return Promise.reject();
  }
};

/**
 * Build srcset
 * @param {*} src
 * @param {*} format
 * @returns
 */
const buildSrcSet = (src, format) =>
  RESOLUTIONS.map(
    ({ width }) =>
      `${src
        .replace(IMG, TMP)
        .replace('.jpg', `.${width}.${format}`)} ${width}w`
  ).join(', ');

module.exports = {
  name: 'cow-image',
  processor: ({ attrs = {} }, { workingDir }) => {
    const { src, alt, sizes, className } = attrs;
    const pictureClassName = ['CowImage', className].filter(c => !!c).join(' ');
    const imgClassName = ['CowImage', className]
      .filter(c => !!c)
      .map(c => `${c}__img`)
      .join(' ');

    if (!src.endsWith('.jpg') && !src.endsWith('.jpeg')) {
      return {
        tag: 'picture',
        attrs: {
          class: pictureClassName,
        },
        content: [
          {
            tag: 'img',
            attrs: {
              class: imgClassName,
              src: BLANK_IMG,
              'data-src': src,
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
                  src,
                  alt,
                },
              },
            ],
          },
        ],
      };
    }

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

    return {
      tag: 'picture',
      attrs: {
        class: pictureClassName,
      },
      content: [
        {
          tag: 'source',
          attrs: {
            'data-srcset': buildSrcSet(src, 'webp'),
            type: 'image/webp',
            sizes: sizes || '100vw',
          },
        },
        {
          tag: 'source',
          attrs: {
            'data-srcset': buildSrcSet(src, 'jpg'),
            type: 'image/jpeg',
            sizes: sizes || '100vw',
          },
        },
        {
          tag: 'img',
          attrs: {
            class: imgClassName,
            src: src.replace(IMG, TMP).replace('.jpg', `.${THUMB.width}.png`),
            'data-src': src
              .replace(IMG, TMP)
              .replace('.jpg', `.${RESOLUTIONS[0].width}.jpg`),
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
                  .replace('.jpg', `.${RESOLUTIONS[0].width}.jpg`),
                alt,
              },
            },
          ],
        },
      ],
    };
  },
};
