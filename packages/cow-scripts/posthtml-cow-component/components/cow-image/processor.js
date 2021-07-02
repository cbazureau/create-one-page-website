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

const convertImg = async (img, res = {}, format) => {
  const { width, quality } = res;
  try {
    const metadata = await sharp(img).metadata();
    const target = img.replace(IMG, TMP).replace('.jpg', `.${width}.${format}`);
    if (fs.existsSync(target)) {
      return Promise.resolve();
    } else if (format === 'jpg') {
      await sharp(img).resize(width).jpeg({ quality }).toFile(target);
    } else if (format === 'png') {
      await sharp(img)
        .resize(width)
        .png({ compressionLevel: Math.round(quality / 10) })
        .toFile(target);
    } else {
      await sharp(img).resize(width).webp({ quality }).toFile(target);
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
    ({ width }) =>
      `${src
        .replace(IMG, TMP)
        .replace('.jpg', `.${width}.${format}`)} ${width}w`
  ).join(', ');
};

module.exports = {
  processor: ({ attrs = {}, content = [] }, { workingDir }) => {
    const { src, alt, sizes, className } = attrs;

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
                  src: src,
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
