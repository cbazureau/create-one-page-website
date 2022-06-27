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
      class: 'MyClassName',
      'data-ref': 'cow-visible',
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
      'data-ref': 'cow-visible',
    },
    content: [...customNode.content],
    tag: 'div',
  });
});

test('cow-visibile with tag', () => {
  const customNode = {
    ...node,
    attrs: {
      tag: 'section',
    },
  };
  expect(processor(customNode, {})).toEqual({
    attrs: {
      'data-ref': 'cow-visible',
    },
    content: [...customNode.content],
    tag: 'section',
  });
});
