# d3-area-chunked

**:warning: This is a fork of [pbeshai/d3-line-chunked](pbeshai/d3-line-chunked)**

[![npm version](https://badge.fury.io/js/d3-area-chunked.svg)](https://badge.fury.io/js/d3-area-chunked)

A d3 plugin that renders an area with potential gaps in the data by styling the gaps differently from the defined areas. It also provides the ability to style arbitrary chunks of the defined data differently. Single points are rendered as circles and transitions are supported.

Blog: [Showing Missing Data in Line Charts](https://bocoup.com/weblog/showing-missing-data-in-line-charts)

Demo: http://frankvanwijk.nl/datavis/d3-area-chunked/

![d3-area-chunked-demo](https://raw.githubusercontent.com/fvanwijk/d3-area-chunked/master/example/d3-area-chunked.gif)

## Example Usage

```js
var areaChunked = d3.areaChunked()
  .x(function (d) { return xScale(d.x); })
  .y0(function (d) { return yScale.range()[0]; })
  .y1(function (d) { return yScale(d.y); })
  .curve(d3.curveLinear)
  .defined(function (d) { return d.y != null; })
  .areaStyles({
    fill: '#0bb',
  });

d3.select('svg')
  .append('g')
    .datum(areaData)
    .transition()
    .duration(1000)
    .call(areaChunked);
```

### Example with multiple areas

```js
var areaChunked = d3.areaChunked()
  .x(function (d) { return xScale(d.x); })
  .y0(function (d) { return yScale.range()[0]; })
  .y1(function (d) { return yScale(d.y); })
  .defined(function (d) { return d.y != null; })
  .areaStyles({
    fill: (d, i) => colorScale(i),
  });

var data = [
  [{ 'x': 0, 'y': 42 }, { 'x': 1, 'y': 76 }, { 'x': 2, 'y': 54 }],
  [{ 'x': 0, 'y': 386 }, { 'x': 1 }, { 'x': 2, 'y': 38 }, { 'x': 3, 'y': 192 }],
  [{ 'x': 0, 'y': 325 }, { 'x': 1, 'y': 132 }, { 'x': 2 }, { 'x': 3, 'y': 180 }]
];

// bind data
var binding = d3.select('svg').selectAll('g').data(data);

// append a `<g>` for each area
var entering = binding.enter().append('g');

// call areaChunked on enter + update
binding.merge(entering)
  .transition()
  .call(areaChunked);

// remove `<g>` when exiting
binding.exit().remove();
```

## Development

Get rollup watching for changes and rebuilding

```bash
npm run watch
```

Run a web server in the example directory

```bash
cd example
php -S localhost:8000
```

Go to http://localhost:8000


## Installing

If you use NPM, `npm install d3-area-chunked`. Otherwise, download the [latest release](https://github.com/fvanwijk/d3-area-chunked/releases/latest).

Note that this project relies on the following d3 features and plugins:
- [d3-array](https://github.com/d3/d3-array)
- [d3-selection](https://github.com/d3/d3-selection)
- [d3-shape](https://github.com/d3/d3-interpolate)

If you are using transitions, you will also need:
- [d3-interpolate](https://github.com/d3/d3-interpolate)
- [d3-interpolate-path](https://github.com/pbeshai/d3-interpolate-path) (plugin)

The only thing not included in the default d3 v4 build is the plugin [d3-interpolate-path](https://github.com/pbeshai/d3-interpolate-path). You'll need to get that [separately](https://github.com/pbeshai/d3-interpolate-path#installing).

## API Reference

<a href="#areaChunked" name="areaChunked">#</a> d3.**areaChunked**()

Constructs a new generator for chunked areas with the default settings.


<a href="#_areaChunked" name="_areaChunked">#</a> *areaChunked*(*context*)

Render the chunked area to the given *context*, which may be either a [d3 selection](https://github.com/d3/d3-selection)
of SVG containers (either SVG or G elements) or a corresponding [d3 transition](https://github.com/d3/d3-transition). Reads the data for the area from the `datum` property on the  container.


<a href="#areaChunked_x" name="areaChunked_x">#</a> *areaChunked*.**x**([*x*])

Define an accessor for getting the `x` value for a data point. See [d3 area.x](https://github.com/d3/d3-shape#area_x) for details.


<a href="#areaChunked_y0" name="areaChunked_y0">#</a> *areaChunked*.**y0**([*y0*])

Define an accessor for getting the `y0` value for a data point. See [d3 area.y0](https://github.com/d3/d3-shape#area_y0) for details.


<a href="#areaChunked_y1" name="areaChunked_y1">#</a> *areaChunked*.**y1**([*y1*])

Define an accessor for getting the `y1` value for a data point. See [d3 area.y1](https://github.com/d3/d3-shape#area_y1) for details.


<a href="#areaChunked_curve" name="areaChunked_curve">#</a> *areaChunked*.**curve**([*curve*])

Get or set the [d3 curve factory](https://github.com/d3/d3-shape#curves) for the area. See [d3 area.curve](https://github.com/d3/d3-shape#area_curve) for details.
Define an accessor for getting the `curve` value for a data point. See [d3 area.curve](https://github.com/d3/d3-shape#area_curve) for details.


<a href="#areaChunked_defined" name="areaChunked_defined">#</a> *areaChunked*.**defined**([*defined*])

Get or set *defined*, a function that given a data point (`d`) returns `true` if the data is defined for that point and `false` otherwise. This function is important for determining where gaps are in the data when your data includes points without data in them.

For example, if your data contains attributes `x` and `y`, but no `y` when there is no data available, you might set *defined* as follows:

```js
// sample data
var data = [{ x: 1, y: 10 }, { x: 2 }, { x: 3 }, { x: 4, y: 15 }, { x: 5, y: 12 }];

// returns true if d has a y value set
function defined(d) {
  return d.y != null;
}
```

It is only necessary to define this if your dataset includes entries for points without data.

The default returns `true` for all points.



<a href="#areaChunked_isNext" name="areaChunked_isNext">#</a> *areaChunked*.**isNext**([*isNext*])

Get or set *isNext*, a function to determine if a data point follows the previous. This function enables detecting gaps in the data when there is an unexpected jump.

For example, if your data contains attributes `x` and `y`, and does not include points with missing data, you might set **isNext** as follows:


```js
// sample data
var data = [{ x: 1, y: 10 }, { x: 4, y: 15 }, { x: 5, y: 12 }];

// returns true if current datum is 1 `x` ahead of previous datum
function isNext(previousDatum, currentDatum) {
  var expectedDelta = 1;
  return (currentDatum.x - previousDatum.x) === expectedDelta;
}
```

It is only necessary to define this if your data doesn't explicitly include gaps in it.

The default returns `true` for all points.


<a href="#areaChunked_transitionInitial" name="areaChunked_transitionInitial">#</a> *areaChunked*.**transitionInitial**([*transitionInitial*])

Get or set *transitionInitial*, a boolean flag that indicates whether to perform a transition on initial render or not. If true and the *context* that *areaChunked* is called in is a transition, then the area will animate its y1 value on initial render. If false, the area will appear rendered immediately with no animation on initial render. This does not affect any subsequent renders and their respective transitions.

The default value is `true`.

<a href="#areaChunked_extendEnds" name="areaChunked_extendEnds">#</a> *areaChunked*.**extendEnds**([*[xMin, xMax]*])

Get or set *extendEnds*, an array `[xMin, xMax]` specifying the minimum and maximum x pixel values
(e.g., `xScale.range()`). If defined, the undefined area will extend to the values provided,
otherwise it will end at the last defined points.


<a href="#areaChunked_accessData" name="areaChunked_accessData">#</a> *areaChunked*.**accessData**([*accessData*])

Get or set *accessData*, a function that specifies how to map from a dataset entry to the array of area data. This is only useful if your input data doesn't use the standard form of `[point1, point2, point3, ...]`. For example, if you pass in your data as `{ results: [point1, point2, point3, ...] }`, you would want to set accessData to `data => data.results`. For convenience, if your accessData function simply accesses a key of an object, you can pass it in directly: `accessData('results')` is equivalent to `accessData(data => data.results)`.

The default value is the identity function `data => data`.


<a href="#areaChunked_areaStyles" name="areaChunked_areaStyles">#</a> *areaChunked*.**areaStyles**([*areaStyles*])

Get or set *areaStyles*, an object mapping style keys to style values to be applied to both defined and undefined areas. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_styles).



<a href="#areaChunked_areaAttrs" name="areaChunked_areaAttrs">#</a> *areaChunked*.**areaAttrs**([*areaAttrs*])

Get or set *areaAttrs*, an object mapping attribute keys to attribute values to be applied to both defined and undefined areas. The passed in *areaAttrs* are merged with the defaults. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_attrs).

The default attrs are:

```js
{
  fill: '#222',
  'fill-opacity': 1,
}
```



<a href="#areaChunked_gapStyles" name="areaChunked_gapStyles">#</a> *areaChunked*.**gapStyles**([*gapStyles*])

Get or set *gapStyles*, an object mapping style keys to style values to be applied only to undefined areas. It overrides values provided in *areaStyles*. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_styles).



<a href="#areaChunked_gapAttrs" name="areaChunked_gapAttrs">#</a> *areaChunked*.**gapAttrs**([*gapAttrs*])

Get or set *gapAttrs*, an object mapping attribute keys to attribute values to be applied only to undefined areas. It overrides values provided in *areaAttrs*. The passed in *gapAttrs* are merged with the defaults. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_attrs).

The default attrs are:

```js
{
  'fill-opacity': 0.2,
}
```


<a href="#areaChunked_pointStyles" name="areaChunked_pointStyles">#</a> *areaChunked*.**pointStyles**([*pointStyles*])

Get or set *pointStyles*, an object mapping style keys to style values to be applied to points. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_styles).



<a href="#areaChunked_pointAttrs" name="areaChunked_pointAttrs">#</a> *areaChunked*.**pointAttrs**([*pointAttrs*])

Get or set *pointAttrs*, an object mapping attr keys to attr values to be applied to points (circles). Note that if fill is not defined in *pointStyles* or *pointAttrs*, it will be read from the fill color on the area itself. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_attrs).



<a href="#areaChunked_chunk" name="areaChunked_chunk">#</a> *areaChunked*.**chunk**([*chunk*])

Get or set *chunk*, a function that given a data point (`d`) returns the name of the chunk it belongs to. This is necessary if you want to have multiple styled chunks of the defined data. There are two reserved chunk names: `"area"` for the default area for defined data, and `"gap"` for undefined data. It is not recommended that you use `"gap"` in this function. The default value maps all data points to `"area"`.

For example, if you wanted all points with y values less than 10 to be in the `"below-threshold"` chunk, you could do the following:

```js
// sample data
var data = [{ x: 1, y: 5 }, { x: 2, y: 8 }, { x: 3, y: 12 }, { x: 4, y: 15 }, { x: 5, y: 6 }];

// inspects the y value to determine which chunk to use.
function chunk(d) {
  return d.y < 10 ? 'below-threshold' : 'area';
}
```


<a href="#areaChunked_chunkAreaResolver" name="areaChunked_chunkAreaResolver">#</a> *areaChunked*.**chunkAreaResolver**([*chunkAreaResolver*])

Get or set *chunkAreaResolver*, a function that decides what chunk the area should be rendered in when given two adjacent defined points that may or may not be in the same chunk via `chunk()`. The function takes three parameters:

  * chunkNameLeft (*String*): The name of the chunk for the point on the left
  * chunkNameRight (*String*): The name of the chunk for the point on the right
  * chunkNames (*String[]*): The ordered list of chunk names from chunkDefinitions

It returns the name of the chunk that the area segment should be rendered in. By default it uses the order of the keys in the chunkDefinition object..

For example, if you wanted all areas between two different chunks to use the styling of the chunk that the left point belongs to, you could define *chunkAreaResolver* as follows:

```js
// always take the chunk of the item on the left
function chunkAreaResolver(chunkNameA, chunkNameB, chunkNames) {
  return chunkNameA;
}
```


<a href="#areaChunked_chunkDefinitions" name="areaChunked_chunkDefinitions">#</a> *areaChunked*.**chunkDefinitions**([*chunkDefinitions*])

Get or set *chunkDefinitions*, an object mapping chunk names to styling and attribute assignments for each chunk. The format is as follows:

```
{
  chunkName1: {
    styles: {},
    attrs: {},
    pointStyles: {},
    pointAttrs: {},
  },
  ...
}
```

Note that by using the reserved chunk names `"area"` and `"gap"`, you can accomplish the equivalent of setting `areaStyles`, `areaAttrs`, `gapStyles`, `gapAttrs`, `pointStyles`, and `pointAttrs` individually. Chunks default to reading settings defined for the chunk `"area"` (or by `areaStyles`, `areaAttrs`), so you can place base styles for all chunks there and not have to duplicate them.

Full multiple chunks example:

```js
const areaChunked = d3.areaChunked()
  .defined(function (d) { return d[1] !== null; })
  .chunkDefinitions({
    area: {
      styles: {
        fill: '#0bb',
      },
    },
    gap: {
      styles: {
        fill: 'none'
      }
    },
    'below-threshold': {
      styles: {
        'fill-opacity': 0.35,
      },
      pointStyles: {
        'fill': '#fff',
        'stroke': '#0bb',
      }
    }
  })
  .chunk(function (d) { return d[1] < 2 ? 'below-threshold' : 'area'; });
```
