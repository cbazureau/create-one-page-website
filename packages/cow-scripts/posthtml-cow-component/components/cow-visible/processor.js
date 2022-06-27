module.exports = {
  name: 'cow-visible',
  processor: ({ attrs = {}, content = [] }) => {
    const { classname, tag = 'div' } = attrs;

    return {
      tag,
      attrs: {
        class: classname,
        'data-ref': 'cow-visible',
      },
      content,
    };
  },
};
