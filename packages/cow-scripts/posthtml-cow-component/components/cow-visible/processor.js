module.exports = {
  processor: ({ attrs = {}, content = [] }, { workingDir }) => {
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
