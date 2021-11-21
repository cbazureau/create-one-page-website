const { processor, name } = require('./processor');

const workingDir = __dirname;

test('cow-inline-svg', () => {
  const node = {
    attrs: { classname: 'MyClassName', src: '../mocks/test.svg' },
  };
  expect(name).toEqual('cow-inline-svg');
  expect(processor(node, { workingDir })).toEqual({
    attrs: {
      class: 'MyClassName',
      viewBox: '0 0 100 100',
    },
    content: [
      {
        attrs: {
          cx: '50',
          cy: '50',
          fill: 'red',
          r: '40',
          stroke: 'black',
          'stroke-width': '3',
        },
        tag: 'circle',
      },
    ],
    tag: 'svg',
  });
});
