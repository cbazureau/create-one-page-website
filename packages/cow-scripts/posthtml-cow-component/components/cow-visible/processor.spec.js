const { processor, name } = require('./processor');

const node = {
  attrs: { classname: 'MyClassName', otherProps: 'other' },
  content: [
    {
      attrs: {
        class: 'foo',
      },
      tag: 'div',
      content: ['bar'],
    },
  ],
};

test('cow-visibile with classname', () => {
  expect(name).toEqual('cow-visible');
  expect(processor(node, {})).toEqual({
    attrs: {
      class: 'CowVisible MyClassName',
    },
    content: [...node.content],
    tag: 'div',
  });
});

test('cow-visibile without classname', () => {
  const customNode = {
    ...node,
    attrs: {},
  };
  expect(processor(customNode, {})).toEqual({
    attrs: {
      class: 'CowVisible',
    },
    content: [...customNode.content],
    tag: 'div',
  });
});
