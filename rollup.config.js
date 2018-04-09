import babel from 'rollup-plugin-babel';

var globals = {
  'd3-array': 'd3',
  'd3-interpolate': 'd3',
  'd3-interpolate-path': 'd3',
  'd3-shape': 'd3',
  'd3-selection': 'd3',
  'd3-transition': 'd3',
};

export default {
  entry: 'index.js',
  moduleName: 'd3',
  plugins: [babel()],
  globals: globals,
  external: Object.keys(globals),
  targets: [
    { format: 'umd', dest: 'build/d3-line-chunked.js' },
    { format: 'umd', dest: 'example/d3-line-chunked.js' },
  ]
};
