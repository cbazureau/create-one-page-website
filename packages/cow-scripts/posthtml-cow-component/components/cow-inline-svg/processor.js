const fs = require('fs-extra');
const path = require('path');
const parser = require('posthtml-parser');

module.exports = {
  name: 'cow-inline-svg',
  processor: ({ attrs = {} }, { workingDir }) => {
    const { className, src } = attrs;

    const file = path.join(workingDir, './src', src);
    if (fs.existsSync(file)) {
      const [svgNode] = parser(fs.readFileSync(file, 'utf-8'));
      const svgClassName = [svgNode.attrs.class, className]
        .filter(c => !!c)
        .join(' ');
      if (svgClassName) svgNode.attrs.class = svgClassName;
      return svgNode;
    }
    return {
      tag: false,
      attrs: {},
      content: [],
    };
  },
};
