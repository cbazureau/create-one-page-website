module.exports = {
  name: 'cow-visible',
  processor: ({ attrs = {}, content = [] }) => {
    const { className } = attrs;
    const divClassName = ['CowVisible', className].filter(c => !!c).join(' ');

    return {
      tag: 'div',
      attrs: {
        class: divClassName,
      },
      content,
    };
  },
};
