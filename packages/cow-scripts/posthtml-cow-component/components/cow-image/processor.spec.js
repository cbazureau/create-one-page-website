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
  attrs: { classname: 'MyClassName', src: '../mocks/fake.jpg', alt: 'my alt' },
  content: [],
};

beforeEach(() => {
  mockSharp.mockReset();
});

test('cow-image with classname', () => {
  const output = processor(node, { workingDir });
  expect(name).toEqual('cow-image');
  expect(output.attrs.class).toEqual('MyClassName');
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

test('cow-image without classname', () => {
  const customNode = {
    ...node,
    attrs: { ...node.attrs, classname: undefined },
  };
  const output = processor(customNode, { workingDir });
  expect(output.attrs['data-ref']).toEqual('cow-image');
});

test('cow-image with high priority', () => {
  const customNode = {
    ...node,
    attrs: { ...node.attrs, fetchpriority: 'high' },
  };
  const output = processor(customNode, { workingDir });
  expect(output).toMatchSnapshot();
});

test('cow-image with png', () => {
  const customNode = {
    ...node,
    attrs: { ...node.attrs, src: '../mocks/fake.png' },
  };
  const output = processor(customNode, { workingDir });
  expect(output).toMatchSnapshot();
  expect(
    mockSharp.mock.calls.map(call =>
      call.map((arg, index) =>
        index === 0 || index === 3 ? arg.replace(__dirname, '') : arg
      )
    )
  ).toEqual([
    ['/mocks/fake.png', 375, { compressionLevel: 8 }, '/mocks/fake.375.png'],
    ['/mocks/fake.png', 375, { quality: 80 }, '/mocks/fake.375.webp'],
    ['/mocks/fake.png', 640, { compressionLevel: 8 }, '/mocks/fake.640.png'],
    ['/mocks/fake.png', 640, { quality: 80 }, '/mocks/fake.640.webp'],
    ['/mocks/fake.png', 750, { compressionLevel: 8 }, '/mocks/fake.750.png'],
    ['/mocks/fake.png', 750, { quality: 80 }, '/mocks/fake.750.webp'],
    ['/mocks/fake.png', 1024, { compressionLevel: 8 }, '/mocks/fake.1024.png'],
    ['/mocks/fake.png', 1024, { quality: 80 }, '/mocks/fake.1024.webp'],
    ['/mocks/fake.png', 1280, { compressionLevel: 8 }, '/mocks/fake.1280.png'],
    ['/mocks/fake.png', 1280, { quality: 80 }, '/mocks/fake.1280.webp'],
    ['/mocks/fake.png', 2048, { compressionLevel: 8 }, '/mocks/fake.2048.png'],
    ['/mocks/fake.png', 2048, { quality: 80 }, '/mocks/fake.2048.webp'],
    ['/mocks/fake.png', 2560, { compressionLevel: 8 }, '/mocks/fake.2560.png'],
    ['/mocks/fake.png', 2560, { quality: 80 }, '/mocks/fake.2560.webp'],
  ]);
});
