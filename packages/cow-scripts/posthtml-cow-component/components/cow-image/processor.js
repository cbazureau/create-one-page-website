const sharp = require('sharp');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const { imgFolder: IMG, tmpFolder: TMP } = require('../../../utils/constants');

/**
 * cleanloop
 * @param {*} obj
 * @returns
 */
const cleanloop = obj => {
  const t = obj;
  // eslint-disable-next-line no-restricted-syntax
  for (const v in t) {
    if (typeof t[v] === 'object') cleanloop(t[v]);
    else if (t[v] === undefined) delete t[v];
  }
  return t;
};

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
const BLANK_IMG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAQAAACRI2S5AAAAEElEQVR42mNkIAAYRxWAAQAG9gAKqv6+AwAAAABJRU5ErkJggg==';

/**
 * getExt
 * @param {*} src
 * @returns
 */
const getExt = src => (src || '').split('.').pop();

/**
 * convertImg
 * @param {*} img
 * @param {*} res
 * @param {*} format
 * @returns
 */
const convertImg = async (img, res = {}, format) => {
  const { width, quality } = res;
  const target = img
    .replace(IMG, TMP)
    .replace(`.${getExt(img)}`, `.${width}.${format}`);
  const filename = target.split(TMP)[1];
  try {
    if (fs.existsSync(target)) {
      // eslint-disable-next-line no-console
      console.log(`  ${chalk.gray(`[cow-image] ${filename} already exists`)}`);
      return true;
    }
    if (format === 'jpg') {
      await sharp(img).resize(width).jpeg({ quality }).toFile(target);
      // eslint-disable-next-line no-console
      console.log(`  ${chalk.green(`[cow-image] ${filename} generated`)}`);
      return true;
    }
    if (format === 'png') {
      await sharp(img)
        .resize(width)
        .png({ compressionLevel: Math.round(quality / 10) })
        .toFile(target);
      // eslint-disable-next-line no-console
      console.log(`  ${chalk.green(`[cow-image] ${filename} generated`)}`);
      return true;
    }
    await sharp(img).resize(width).webp({ quality }).toFile(target);
    // eslint-disable-next-line no-console
    console.log(`  ${chalk.green(`[cow-image] ${filename} generated`)}`);
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`  ${chalk.red(`[cow-image] ${filename} can't be generated`)}`);
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
        .replace(`.${getExt(src)}`, `.${width}.${format}`)} ${width}w`
  ).join(', ');

module.exports = {
  name: 'cow-image',
  processor: ({ attrs = {} }, { workingDir }) => {
    const { src, alt, sizes, classname, fetchpriority } = attrs;
    const pictureClassName = classname;
    const isHighPriority = fetchpriority === 'high';

    if (!['jpeg', 'jpg', 'png'].includes(getExt(src))) {
      return cleanloop({
        tag: 'picture',
        attrs: {
          class: pictureClassName,
          'data-ref': isHighPriority ? undefined : 'cow-image',
        },
        content: [
          {
            tag: 'img',
            attrs: {
              src: isHighPriority ? src : BLANK_IMG,
              'data-src': isHighPriority ? undefined : src,
              alt,
            },
          },
          {
            tag: 'noscript',
            content: [
              {
                tag: 'img',
                attrs: {
                  src,
                  alt,
                },
              },
            ],
          },
        ],
      });
    }

    const ext = getExt(src);
    const outputExt = ext === 'png' ? 'png' : 'jpg';

    (async () => {
      fs.ensureDir(path.join(workingDir, TMP));
      await RESOLUTIONS.reduce(
        (acc, res) => [
          ...acc,
          { format: outputExt, res },
          { format: 'webp', res },
        ],
        []
      ).forEach(async ({ format, res }) => {
        await convertImg(path.join(workingDir, './src', src), res, format);
      });
      await convertImg(path.join(workingDir, './src', src), THUMB, 'png');
    })();

    return cleanloop({
      tag: 'picture',
      attrs: {
        class: pictureClassName,
        'data-ref': isHighPriority ? undefined : 'cow-image',
      },
      content: [
        {
          tag: 'source',
          attrs: {
            'data-srcset': isHighPriority
              ? undefined
              : buildSrcSet(src, 'webp'),
            srcset: isHighPriority ? buildSrcSet(src, 'webp') : undefined,
            type: 'image/webp',
            sizes: sizes || '100vw',
          },
        },
        {
          tag: 'source',
          attrs: {
            'data-srcset': isHighPriority
              ? undefined
              : buildSrcSet(src, outputExt),
            srcset: isHighPriority ? buildSrcSet(src, outputExt) : undefined,
            type: outputExt === 'png' ? 'image/png' : 'image/jpeg',
            sizes: sizes || '100vw',
          },
        },
        {
          tag: 'img',
          fetchpriority: isHighPriority ? 'high' : undefined,
          attrs: {
            src: isHighPriority
              ? src
                  .replace(IMG, TMP)
                  .replace(`.${ext}`, `.${RESOLUTIONS[0].width}.${outputExt}`)
              : src.replace(IMG, TMP).replace(`.${ext}`, `.${THUMB.width}.png`),
            'data-src': isHighPriority
              ? undefined
              : src
                  .replace(IMG, TMP)
                  .replace(`.${ext}`, `.${RESOLUTIONS[0].width}.${outputExt}`),
            alt,
          },
        },
        {
          tag: 'noscript',
          content: [
            {
              tag: 'img',
              attrs: {
                src: src
                  .replace(IMG, TMP)
                  .replace(`.${ext}`, `.${RESOLUTIONS[0].width}.${outputExt}`),
                alt,
              },
            },
          ],
        },
      ],
    });
  },
};
