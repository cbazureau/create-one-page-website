module.exports = {
  name: 'cow-visible',
  processor: ({ attrs = {}, content = [] }) => {
    const { classname } = attrs;
    const divClassName = ['CowVisible', classname].filter(c => !!c).join(' ');

    return {
      tag: 'div',
      attrs: {
        class: divClassName,
      },
      content,
    };
  },
};
