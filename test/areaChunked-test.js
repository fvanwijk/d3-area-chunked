/* eslint-disable */
const tape = require('tape');
const transition = require('d3-transition');
const select = require('d3-selection').select;
const jsdom = require('jsdom');
const areaChunked = require('../').areaChunked;

const definedAreaClass = '.d3-area-chunked-defined';
const undefinedAreaClass = '.d3-area-chunked-undefined';
const definedPointClass = '.d3-area-chunked-defined-point';

function getDocument() {
  const { JSDOM } = jsdom;  
  const { document } = (new JSDOM('<!doctype html><html><body></body></html>')).window;  
  return document;
}

function lengthOfPath(path) {
  if (!path || path.empty()) {
    return null;
  }

  const d = path.attr('d');
  if (d == null || !d.length) {
    return 0;
  }

  // only count M and L since we are using curveLinear
  return d.split(/(?=[ML])/).length / 2;
}

function rectDimensions(rect) {
  rect = select(rect);
  return {
    x: rect.attr('x'),
    y: rect.attr('y'),
    width: rect.attr('width'),
    height: rect.attr('height')
  };
}

// NOTE: stroke-width 0 is used in the tests to prevent accounting for the stroke-width adjustments
// added in https://github.com/pbeshai/d3-line-chunked/issues/2

tape('areaChunked() getter and setters work', function (t) {
  const chunked = areaChunked();

  t.equal(chunked.x(1).x()(9), 1, 'x makes constant function');
  t.equal(chunked.x(d => 2 * d).x()(2), 4, 'x sets function');
  t.equal(chunked.y0(1).y0()(9), 1, 'y0 makes constant function');
  t.equal(chunked.y0(d => 2 * d).y0()(2), 4, 'y0 sets function');
  t.equal(chunked.y1(1).y1()(9), 1, 'y1 makes constant function');
  t.equal(chunked.y1(d => 2 * d).y1()(2), 4, 'y1 sets function');
  t.equal(chunked.defined(false).defined()(9), false, 'defined makes constant function');
  t.equal(chunked.defined(d => d > 4).defined()(5), true, 'defined sets function');
  t.equal(chunked.isNext(false).isNext()(3), false, 'isNext makes constant function');
  t.equal(chunked.isNext(d => d > 4).isNext()(3), false, 'isNext sets function');
  t.equal(chunked.chunk('my-chunk').chunk()(9), 'my-chunk', 'chunk makes constant function');
  t.equal(chunked.chunk(d => d > 4 ? 'foo' : 'bar').chunk()(5), 'foo', 'chunk sets function');
  t.equal(chunked.chunkAreaResolver((a, b) => a).chunkAreaResolver()('a', 'b'), 'a', 'chunkAreaResolver sets function');
  t.deepEqual(chunked.chunkDefinitions({ chunk1: { styles: { color: 'red' } } }).chunkDefinitions(), { chunk1: { styles: { color: 'red' } } }, 'chunkDefinitions sets object');
  t.equal(chunked.curve(d => 5).curve()(3), 5, 'curve sets function');
  t.deepEqual(chunked.areaStyles({ fill: 'red' }).areaStyles(), { fill: 'red' }, 'areaStyles sets object');
  t.deepEqual(chunked.areaAttrs({ fill: 'red' }).areaAttrs(), { fill: 'red' }, 'areaAttrs sets object');
  t.deepEqual(chunked.gapStyles({ fill: 'red' }).gapStyles(), { fill: 'red' }, 'gapStyles sets object');
  t.deepEqual(chunked.gapAttrs({ fill: 'red' }).gapAttrs(), { fill: 'red' }, 'gapAttrs sets object');
  t.deepEqual(chunked.pointStyles({ fill: 'red' }).pointStyles(), { fill: 'red' }, 'pointStyles sets object');
  t.deepEqual(chunked.pointAttrs({ fill: 'red' }).pointAttrs(), { fill: 'red' }, 'pointAttrs sets object');
  t.equal(chunked.transitionInitial(false).transitionInitial(), false, 'transitionInitial sets boolean');
  t.deepEqual(chunked.extendEnds([5, 20]).extendEnds(), [5, 20], 'extendEnds sets array');
  t.deepEqual(chunked.accessData(d => d.results).accessData()({ results: [5, 20] }), [5, 20], 'accessData sets function');
  t.deepEqual(chunked.accessData('results').accessData()({ results: [5, 20] }), [5, 20], 'accessData sets string');

  t.end();
});
/*
<path clip-path="url(#my-clip-path)" d="M0,1L0,2" fill="#222" stroke="none" fill-opacity="1" class="d3-area-chunked-defined" />
<path d="M0,1L0,2" fill="#222" fill-opacity="0.2" stroke="none" class="d3-area-chunked-undefined" />
<circle ...>
<defs><clippath id="my-clip-path"><rect x="0" width="0" y="1" height="2"></rect></clippath></defs>
*/

tape('areaChunked() with empty data', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked();
  const data = [];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 0);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 0);
  t.ok(g.select(definedPointClass).empty());
  t.ok(g.selectAll('clipPath').selectAll('rect').empty());

  t.end();
});


tape('areaChunked() with one data point', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked();
  const data = [[0, 1]];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 1);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 1);
  t.equal(g.select(definedPointClass).size(), 1);
  t.equal(g.selectAll('clipPath').selectAll('rect').size(), 1);

  t.end();
});

tape('areaChunked() with null transition to null', function (t) {
  const document = getDocument();

  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked().defined(d => d[1] != null);
  const data = [[0, null]];

  g.datum(data).call(chunked).transition().call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 0);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 0);
  t.equal(g.select(definedPointClass).size(), 0);
  t.equal(g.selectAll('clipPath').selectAll('rect').size(), 0);

  t.end();
});


tape('areaChunked() with many data points', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked().areaAttrs({ 'stroke-width': 0 });
  const data = [[0, 1], [1, 2], [2, 1]];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 3);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 3);
  t.equal(g.select(definedPointClass).size(), 0);
  const rects = g.selectAll('clipPath').selectAll('rect');
  t.equal(rects.size(), 1);
  t.deepEqual(rectDimensions(rects.nodes()[0]), { x: '0', width: '2', y: '0', height: '2' });

  t.end();
});

// this test is important to make sure we don't keep adding in new paths
tape('areaChunked() updates existing path', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked().areaAttrs({ 'stroke-width': 0 });
  const data = [[0, 1], [1, 2], [2, 1]];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 3);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 3);
  t.equal(g.selectAll(definedAreaClass).size(), 1);
  t.equal(g.selectAll(undefinedAreaClass).size(), 1);

  g.datum([[5, 1], [3, 2]]).call(chunked);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 2);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 2);
  t.equal(g.selectAll(definedAreaClass).size(), 1);
  t.equal(g.selectAll(undefinedAreaClass).size(), 1);

  t.end();
});

tape('areaChunked() with many data points and some undefined', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked()
    .areaAttrs({ 'stroke-width': 0 })
    .defined(d => d[1] !== null);

  const data = [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3]];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 5);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 5);
  t.equal(g.select(definedPointClass).size(), 1);

  const rects = g.selectAll('clipPath').selectAll('rect');
  t.equal(rects.size(), 3);
  t.deepEqual(rectDimensions(rects.nodes()[0]), { x: '0', width: '1', y: '0', height: '3' });
  t.deepEqual(rectDimensions(rects.nodes()[1]), { x: '4', width: '0', y: '0', height: '3' });
  t.deepEqual(rectDimensions(rects.nodes()[2]), { x: '6', width: '1', y: '0', height: '3' });

  t.end();
});


tape('areaChunked() sets attrs and styles', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked()
    .areaAttrs({
      'stroke-width': 4,
      fill: (d, i) => i === 0 ? 'blue' : 'red',
    })
    .areaStyles({
      stroke: 'purple',
      fill: (d, i) => i === 0 ? 'orange' : 'green',
    })
    .gapAttrs({
      'stroke-width': 2,
      fill: (d, i) => i === 0 ? 'teal' : 'cyan',
    })
    .gapStyles({
      fill: (d, i) => i === 0 ? 'magenta' : 'brown',
    })
    .pointAttrs({
      'r': 20,
    })
    .pointStyles({
      stroke: 'maroon',
      fill: (d, i) => i === 0 ? 'indigo' : 'violet',
    })
    .defined(d => d[1] !== null);

  const data = [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3]];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  const area = g.select(definedAreaClass);
  const gap = g.select(undefinedAreaClass);
  const point = g.select('circle');

  t.equal(area.attr('stroke-width'), '4');
  t.equal(area.attr('fill'), 'blue');
  t.equal(area.style('stroke'), 'purple');
  t.equal(area.style('fill'), 'orange');

  t.equal(gap.attr('stroke-width'), '2');
  t.equal(gap.attr('fill'), 'teal');
  t.equal(gap.style('stroke'), 'purple');
  t.equal(gap.style('fill'), 'magenta');

  t.equal(point.attr('r'), '20');
  t.equal(point.attr('fill'), 'blue');
  t.equal(point.style('stroke'), 'maroon');
  t.equal(point.style('fill'), 'indigo');

  t.end();
});

tape('areaChunked() sets attrs and styles via chunkDefinitions', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked()
    .chunkDefinitions({
      area: {
        attrs: {
          'stroke-width': 4,
          fill: (d, i) => i === 0 ? 'blue' : 'red',
        },
        styles: {
          stroke: 'purple',
          fill: (d, i) => i === 0 ? 'orange' : 'green',
        },
        pointAttrs: {
          'r': 20,
        },
        pointStyles: {
          fill: (d, i) => i === 0 ? 'indigo' : 'violet',
        }
      },
      gap: {
        attrs: {
          'stroke-width': 2,
          fill: (d, i) => i === 0 ? 'teal' : 'cyan',
        },
        styles: {
          fill: (d, i) => i === 0 ? 'magenta' : 'brown',
        }
      },
      chunk1: {
        attrs: {
          stroke: 'orange',
          'stroke-width': 5
        },
        styles: {
          'fill-opacity': 0.2
        },
      }
    })
    .chunk(d => 'chunk1')
    .defined(d => d[1] !== null);

  const data = [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3]];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  const area = g.select('.d3-area-chunked-chunk-chunk1');
  const gap = g.select(undefinedAreaClass);
  const point = g.select('circle');

  t.equal(area.attr('stroke'), 'orange');
  t.equal(area.attr('stroke-width'), '5');
  t.equal(area.attr('fill'), 'blue');
  t.equal(area.style('stroke'), 'purple');
  t.equal(area.style('fill'), 'orange');
  t.equal(area.style('fill-opacity'), '0.2');

  t.equal(gap.attr('stroke-width'), '2');
  t.equal(gap.attr('fill'), 'teal');
  t.equal(gap.style('stroke'), 'purple');
  t.equal(gap.style('fill'), 'magenta');

  t.equal(point.attr('r'), '20');
  t.equal(point.attr('fill'), 'blue');
  t.equal(point.style('fill'), 'indigo');

  t.end();
});



tape('areaChunked() stroke width clipping adjustments', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked()
    .areaAttrs({ 'stroke-width': 2 })
    .defined(d => d[1] !== null);

  const data = [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3]];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 5);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 5);
  t.equal(g.select(definedPointClass).size(), 1);

  const rects = g.selectAll('clipPath').selectAll('rect');
  t.equal(rects.size(), 3);
  t.deepEqual(rectDimensions(rects.nodes()[0]), { x: '-2', width: '3', y: '-2', height: '7' });
  t.deepEqual(rectDimensions(rects.nodes()[1]), { x: '4', width: '0', y: '-2', height: '7' });
  t.deepEqual(rectDimensions(rects.nodes()[2]), { x: '6', width: '3', y: '-2', height: '7' });

  t.end();
});


tape('areaChunked() when context is a transition', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked()
    .areaAttrs({ 'stroke-width': 0 })
    .defined(d => d[1] !== null);

  const data = [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3]];

  g.datum(data).transition().duration(0).call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 5);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 5);
  t.equal(g.select(definedPointClass).size(), 1);

  const rects = g.selectAll('clipPath').selectAll('rect');
  t.equal(rects.size(), 3);
  t.deepEqual(rectDimensions(rects.nodes()[0]), { x: '0', width: '1', y: '0', height: '3' });
  t.deepEqual(rectDimensions(rects.nodes()[1]), { x: '4', width: '0', y: '0', height: '3' });
  t.deepEqual(rectDimensions(rects.nodes()[2]), { x: '6', width: '1', y: '0', height: '3' });

  t.end();
});


tape('areaChunked() - defined and isNext can set gaps in data', function (t) {
  const document = getDocument();
  const gDefined = select(document.body).append('svg').append('g');

  const chunkedDefined = areaChunked()
    .areaAttrs({ 'stroke-width': 0 })
    .defined(d => d[1] !== null);

  const dataDefined = [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3]];
  gDefined.datum(dataDefined).call(chunkedDefined);

  const gIsNext = select(document.body).append('svg').append('g');

  const chunkedIsNext = areaChunked()
    .areaAttrs({ 'stroke-width': 0 })
    .isNext((prev, curr) => curr[0] === prev[0] + 1);

  const dataIsNext = [[0, 1], [1, 2], [4, 1], [6, 2], [7, 3]];
  gIsNext.datum(dataIsNext).call(chunkedIsNext);

  // should produce the same clip paths
  const rectsDefined = gDefined.selectAll('clipPath').node().innerHTML;
  const rectsIsNext = gIsNext.selectAll('clipPath').node().innerHTML;
  t.equal(rectsDefined, rectsIsNext);

  t.end();
});

tape('areaChunked() with extendEnds set', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked()
    .areaAttrs({ 'stroke-width': 0 })
    .extendEnds([0, 10])
    .defined(d => d[1] !== null);

  const data = [[1, 2], [2, 1], [3, null], [4, 1], [5, null], [6, 2], [7, 3]];

  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  t.equal(lengthOfPath(g.select(definedAreaClass)), 7);
  t.equal(lengthOfPath(g.select(undefinedAreaClass)), 7);
  t.equal(g.select(definedPointClass).size(), 1);

  const undefPathPoints = g.select(undefinedAreaClass).attr('d').split(/(?=[ML])/);
  // should move to edge and area to first point
  t.equal(undefPathPoints[0], 'M0,2');
  t.equal(undefPathPoints[1], 'L1,2');

  // should area to end point
  t.equal(undefPathPoints[undefPathPoints.length - 1], 'L0,0Z');

  const rects = g.selectAll('clipPath').selectAll('rect');
  t.equal(rects.size(), 3);
  t.deepEqual(rectDimensions(rects.nodes()[0]), { x: '1', width: '1', y: '0', height: '3' });
  t.deepEqual(rectDimensions(rects.nodes()[1]), { x: '4', width: '0', y: '0', height: '3' });
  t.deepEqual(rectDimensions(rects.nodes()[2]), { x: '6', width: '1', y: '0', height: '3' });

  t.end();
});

tape('areaChunked() resolves chunk areas correctly', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked()
    .chunkDefinitions({
      area: {
        styles: { stroke: 'red', 'stroke-width': 0 }, // use stroke-width 0 to remove strokeWidth adjustments to params
      },
      gap: {
        styles: { stroke: 'silver' },
      },
      chunk1: {
        styles: { stroke: 'blue', 'stroke-width': 0 }, // use stroke-width 0 to remove strokeWidth adjustments to params
      },
    })
    .chunk(d => d[1] > 1 ? 'chunk1' : 'area')
    .defined(d => d[1] !== null);

  const data = [[0, 2], [1, 1], [2, 2], [3, null], [4, 1], [5, 2], [6, 1], [7, 1], [8, null], [9, 2], [10, null]];
  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  const expectedAttrs = {
    area: [
      { x: '1', width: '0' },
      { x: '4', width: '0' },
      { x: '6', width: '1' },
    ],
    chunk1: [
      { x: '0', width: '2' },
      { x: '4', width: '2' },
      { x: '9', width: '0' },
    ]
  };
  const areaRects = g.select('.d3-area-chunked-clip-area').selectAll('rect').nodes();
  const chunk1Rects = g.select('.d3-area-chunked-clip-chunk1').selectAll('rect').nodes();

  areaRects.forEach((rect, i) => {
    t.equal(select(rect).attr('x'), expectedAttrs.area[i].x);
    t.equal(select(rect).attr('width'), expectedAttrs.area[i].width);
  });

  chunk1Rects.forEach((rect, i) => {
    t.equal(select(rect).attr('x'), expectedAttrs.chunk1[i].x);
    t.equal(select(rect).attr('width'), expectedAttrs.chunk1[i].width);
  });

  t.end();
});

tape('areaChunked() puts circles above paths when using multiple chunks', function (t) {
  const document = getDocument();
  const g = select(document.body).append('svg').append('g');

  const chunked = areaChunked()
    .chunkDefinitions({
      area: {
        styles: { stroke: 'red', 'stroke-width': 0 }, // use stroke-width 0 to remove strokeWidth adjustments to params
      },
      gap: {
        styles: { stroke: 'silver' },
      },
      chunk1: {
        styles: { stroke: 'blue', 'stroke-width': 0 }, // use stroke-width 0 to remove strokeWidth adjustments to params
      },
    })
    .chunk(d => d[1] > 1 ? 'chunk1' : 'area')
    .defined(d => d[1] !== null);

  const data = [[0, 2], [1, 1], [2, 2], [3, null], [4, 1], [5, 2], [6, 1], [7, 1], [8, null], [9, 2], [10, null]];
  g.datum(data).call(chunked);
  // console.log(g.node().innerHTML);

  const children = g.selectAll('*').nodes().map(node => node.nodeName.toLowerCase());

  let lastPathIndex = -1;
  let firstCircleIndex = Infinity;
  children.forEach((child, i) => {
    if (child === 'path') {
      lastPathIndex = i;
    }

    if (firstCircleIndex === Infinity &&  child === 'circle') {
      firstCircleIndex = i;
    }
  });

  t.equal(lastPathIndex < firstCircleIndex, true, `last path was at ${lastPathIndex}, first circle was at ${firstCircleIndex}`);

  t.end();
});

