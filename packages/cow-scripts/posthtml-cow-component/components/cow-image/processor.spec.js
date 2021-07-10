/* eslint-disable arrow-body-style */
const { processor, name } = require('./processor');

const workingDir = __dirname;

const mockSharp = jest.fn();

jest.mock('sharp', () => a => {
  return {
    resize: b => {
      return {
        jpeg: c => {
          return { toFile: d => mockSharp(a, b, c, d) };
        },
        png: c => {
          return { toFile: d => mockSharp(a, b, c, d) };
        },
        webp: c => {
          return { toFile: d => !mockSharp(a, b, c, d) };
        },
      };
    },
  };
});

const node = {
  attrs: { className: 'MyClassName', src: '../mocks/fake.jpg', alt: 'my alt' },
  content: [],
};

beforeEach(() => {
  mockSharp.mockReset();
});

test('cow-image with className', () => {
  const output = processor(node, { workingDir });
  expect(name).toEqual('cow-image');
  expect(output.attrs.class).toEqual('CowImage MyClassName');
  expect(output).toMatchSnapshot();
  expect(
    mockSharp.mock.calls.map(call =>
      call.map((arg, index) =>
        index === 0 || index === 3 ? arg.replace(__dirname, '') : arg
      )
    )
  ).toEqual([
    ['/mocks/fake.jpg', 375, { quality: 80 }, '/mocks/fake.375.jpg'],
    ['/mocks/fake.jpg', 375, { quality: 80 }, '/mocks/fake.375.webp'],
    ['/mocks/fake.jpg', 640, { quality: 80 }, '/mocks/fake.640.jpg'],
    ['/mocks/fake.jpg', 640, { quality: 80 }, '/mocks/fake.640.webp'],
    ['/mocks/fake.jpg', 750, { quality: 80 }, '/mocks/fake.750.jpg'],
    ['/mocks/fake.jpg', 750, { quality: 80 }, '/mocks/fake.750.webp'],
    ['/mocks/fake.jpg', 1024, { quality: 80 }, '/mocks/fake.1024.jpg'],
    ['/mocks/fake.jpg', 1024, { quality: 80 }, '/mocks/fake.1024.webp'],
    ['/mocks/fake.jpg', 1280, { quality: 80 }, '/mocks/fake.1280.jpg'],
    ['/mocks/fake.jpg', 1280, { quality: 80 }, '/mocks/fake.1280.webp'],
    ['/mocks/fake.jpg', 2048, { quality: 80 }, '/mocks/fake.2048.jpg'],
    ['/mocks/fake.jpg', 2048, { quality: 80 }, '/mocks/fake.2048.webp'],
    ['/mocks/fake.jpg', 2560, { quality: 80 }, '/mocks/fake.2560.jpg'],
    ['/mocks/fake.jpg', 2560, { quality: 80 }, '/mocks/fake.2560.webp'],
  ]);
});

test('cow-image without className', () => {
  const customNode = {
    ...node,
    attrs: { ...node.attrs, className: undefined },
  };
  const output = processor(customNode, { workingDir });
  expect(output.attrs.class).toEqual('CowImage');
});

test('cow-image with png', () => {
  const customNode = {
    ...node,
    attrs: { ...node.attrs, src: '../mocks/fake.png' },
  };
  const output = processor(customNode, { workingDir });
  expect(output).toMatchSnapshot();
});
