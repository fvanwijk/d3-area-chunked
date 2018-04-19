(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-selection'), require('d3-shape'), require('d3-interpolate-path')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-selection', 'd3-shape', 'd3-interpolate-path'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3,global.d3));
}(this, (function (exports,d3Array,d3Selection,d3Shape,d3InterpolatePath) { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

// only needed if using transitions

// used to generate IDs for clip paths
var counter = 0;

/**
 * Renders area with potential gaps in the data by styling the gaps differently
 * from the defined areas. Single points are rendered as circles. Transitions are
 * supported.
 */
function areaChunked () {
  var defaultAreaAttrs = {
    fill: '#222',
    stroke: 'none',
    'stroke-width': 0,
    'fill-opacity': 1
  };
  var defaultGapAttrs = {
    'fill-opacity': 0.35
  };
  var defaultPointAttrs = {
    // read fill and r at render time in case the areaAttrs changed
    // fill: defaultAreaAttrs.fill,
    // r: defaultAreaAttrs['stroke-width'],
  };

  var areaChunkName = 'area';
  var gapChunkName = 'gap';

  /**
   * How to access the x attribute of `d`
   */
  var x = function x(d) {
    return d[0];
  };

  /**
   * How to access the y attribute of `d`
   */
  var y1 = function y1(d) {
    return d[1];
  };

  /**
   * How to get the base line of the area
   */
  var y0 = function y0() {
    return y1([0, 0]);
  };

  /**
   * Function to determine if there is data for a given point.
   * @param {Any} d data point
   * @return {Boolean} true if the data is defined for the point, false otherwise
   */
  var defined = function defined() {
    return true;
  };

  /**
   * Function to determine if there a point follows the previous. This functions
   * enables detecting gaps in the data when there is an unexpected jump. For
   * instance, if you have time data for every day and the previous data point
   * is for January 5, 2016 and the current data point is for January 12, 2016,
   * then there is data missing for January 6-11, so this function would return
   * true.
   *
   * It is only necessary to define this if your data doesn't explicitly include
   * gaps in it.
   *
   * @param {Any} previousDatum The previous data point
   * @param {Any} currentDatum The data point under consideration
   * @return {Boolean} true If the data is defined for the point, false otherwise
   */
  var isNext = function isNext() {
    return true;
  };

  /**
   * Function to determine which chunk this data is within.
   *
   * @param {Any} d data point
   * @param {Any[]} data the full dataset
   * @return {String} The id of the chunk. Defaults to "area"
   */
  var chunk = function chunk() {
    return areaChunkName;
  };

  /**
   * Decides what area the chunk should be in when given two defined points
   * in different chunks. Uses the order provided by the keys of chunkDefinition
   * if not specified, with `area` and `gap` prepended to the list if not
   * in the chunkDefinition object.
   *
   * @param {String} chunkNameLeft The name of the chunk for the point on the left
   * @param {String} chunkNameRight The name of the chunk for the point on the right
   * @param {String[]} chunkNames the ordered list of chunk names from chunkDefinitions
   * @return {String} The name of the chunk to assign the area segment between the two points to.
   */
  var chunkAreaResolver = function defaultChunkAreaResolver(chunkNameLeft, chunkNameRight, chunkNames) {
    var leftIndex = chunkNames.indexOf(chunkNameLeft);
    var rightIndex = chunkNames.indexOf(chunkNameRight);

    return leftIndex > rightIndex ? chunkNameLeft : chunkNameRight;
  };

  /**
   * Object specifying how to set style and attributes for each chunk.
   * Format is an object:
   *
   * {
   *   chunkName1: {
   *     styles: {},
   *     attrs: {},
   *     pointStyles: {},
   *     pointAttrs: {},
   *   },
   *   ...
   * }
   */
  var chunkDefinitions = {};

  /**
   * Passed through to d3.area().curve. Default value: d3.curveLinear.
   */
  var curve = d3Shape.curveLinear;

  /**
   * Object mapping style keys to style values to be applied to both
   * defined and undefined areas. Uses syntax similar to d3-selection-multi.
   */
  var areaStyles = {};

  /**
   * Object mapping attr keys to attr values to be applied to both
   * defined and undefined areas. Uses syntax similar to d3-selection-multi.
   */
  var areaAttrs = defaultAreaAttrs;

  /**
   * Object mapping style keys to style values to be applied only to the
   * undefined areas. It overrides values provided in areaStyles. Uses
   * syntax similar to d3-selection-multi.
   */
  var gapStyles = {};

  /**
   * Object mapping attr keys to attr values to be applied only to the
   * undefined areas. It overrides values provided in areaAttrs. Uses
   * syntax similar to d3-selection-multi.
   */
  var gapAttrs = defaultGapAttrs;

  /**
   * Object mapping style keys to style values to be applied to points.
   * Uses syntax similar to d3-selection-multi.
   */
  var pointStyles = {};

  /**
   * Object mapping attr keys to attr values to be applied to points.
   * Note that if fill is not defined in pointStyles or pointAttrs, it
   * will be read from the stroke color on the area itself.
   * Uses syntax similar to d3-selection-multi.
   */
  var pointAttrs = defaultPointAttrs;

  /**
   * Flag to set whether to transition on initial render or not. If true,
   * the area starts out flat and transitions in its y value. If false,
   * it just immediately renders.
   */
  var transitionInitial = true;

  /**
   * An array `[xMin, xMax]` specifying the minimum and maximum x pixel values
   * (e.g., `xScale.range()`). If defined, the undefined area will extend to
   * the the values provided, otherwise it will end at the last defined points.
   */
  var extendEnds = void 0;

  /**
   * Function to determine how to access the area data array from the passed in data
   * Defaults to the identity data => data.
   * @param {Any} data area dataset
   * @return {Array} The array of data points for that given area
   */
  var accessData = function accessData(data) {
    return data;
  };

  /**
   * A flag specifying whether to render in debug mode or not.
   */
  var debug = false;

  /**
   * Logs warnings if the chunk definitions uses 'style' or 'attr' instead of
   * 'styles' or 'attrs'
   */
  function validateChunkDefinitions() {
    Object.keys(chunkDefinitions).forEach(function (key) {
      var def = chunkDefinitions[key];
      if (def.style != null) {
        console.warn('Warning: chunkDefinitions expects "styles", but found "style" in ' + key, def);
      }
      if (def.attr != null) {
        console.warn('Warning: chunkDefinitions expects "attrs", but found "attr" in ' + key, def);
      }
      if (def.pointStyle != null) {
        console.warn('Warning: chunkDefinitions expects "pointStyles", but found "pointStyle" in ' + key, def);
      }
      if (def.pointAttr != null) {
        console.warn('Warning: chunkDefinitions expects "pointAttrs", but found "pointAttr" in ' + key, def);
      }
    });
  }

  /**
   * Helper to get the chunk names that are defined. Prepends
   * area, gap to the start of the array unless useChunkDefOrder
   * is specified. In this case, it only prepends if they are
   * not specified in the chunk definitions.
   */
  function getChunkNames(useChunkDefOrder) {
    var chunkDefNames = Object.keys(chunkDefinitions);
    var prependArea = true;
    var prependGap = true;

    // if using chunk definition order, only prepend area/gap if they aren't in the
    // chunk definition.
    if (useChunkDefOrder) {
      prependArea = !chunkDefNames.includes(areaChunkName);
      prependGap = !chunkDefNames.includes(gapChunkName);
    }

    if (prependGap) {
      chunkDefNames.unshift(gapChunkName);
    }

    if (prependArea) {
      chunkDefNames.unshift(areaChunkName);
    }

    // remove duplicates and return
    return chunkDefNames.filter(function (d, i, a) {
      return a.indexOf(d) === i;
    });
  }

  /**
   * Helper function to compute the contiguous segments of the data
   * @param {String} chunkName the chunk name to match. points not matching are removed.
   *   if undefined, uses 'area'.
   * @param {Array} definedSegments An array of segments (subarrays) of the defined area data (output from
   *   computeDefinedSegments)
   * @return {Array} An array of segments (subarrays) of the chunk area data
   */
  function computeChunkedSegments(chunkName, definedSegments) {
    // helper to split a segment into sub-segments based on the chunk name
    function splitSegment(segment, chunkNames) {
      var startNewSegment = true;

      // helper for adding to a segment / creating a new one
      function addToSegment(segments, d) {
        // if we are starting a new segment, start it with this point
        if (startNewSegment) {
          segments.push([d]);
          startNewSegment = false;

          // otherwise add to the last segment
        } else {
          var lastSegment = segments[segments.length - 1];
          lastSegment.push(d);
        }
      }

      var segments = segment.reduce(function (segments, d, i) {
        var dChunkName = chunk(d);
        var dPrev = segment[i - 1];
        var dNext = segment[i + 1];

        // if it matches name, add to the segment
        if (dChunkName === chunkName) {
          addToSegment(segments, d);
        } else {
          // check if this point belongs in the previous chunk:
          var added = false;
          // doesn't match chunk name, but does it go in the segment? as the end?
          if (dPrev) {
            var segmentChunkName = chunkAreaResolver(chunk(dPrev), dChunkName, chunkNames);

            // if it is supposed to be in this chunk, add it in
            if (segmentChunkName === chunkName) {
              addToSegment(segments, d);
              added = true;
              startNewSegment = false;
            }
          }

          // doesn't belong in previous, so does it belong in next?
          if (!added && dNext != null) {
            // check if this point belongs in the next chunk
            var nextSegmentChunkName = chunkAreaResolver(dChunkName, chunk(dNext), chunkNames);

            // if it's supposed to be in the next chunk, create it
            if (nextSegmentChunkName === chunkName) {
              segments.push([d]);
              added = true;
              startNewSegment = false;
            } else {
              startNewSegment = true;
            }

            // not previous or next
          } else if (!added) {
            startNewSegment = true;
          }
        }

        return segments;
      }, []);

      return segments;
    }

    var chunkNames = getChunkNames(true);

    var chunkSegments = definedSegments.reduce(function (carry, segment) {
      var newSegments = splitSegment(segment, chunkNames);
      if (newSegments && newSegments.length) {
        return carry.concat(newSegments);
      }

      return carry;
    }, []);

    return chunkSegments;
  }

  /**
   * Helper function to compute the contiguous segments of the data
   * @param {Array} areaData the area data
   * @param {String} chunkName the chunk name to match. points not matching are removed.
   *   if undefined, uses 'area'.
   * @return {Array} An array of segments (subarrays) of the area data
   */
  function computeDefinedSegments(areaData) {
    var startNewSegment = true;

    // split into segments of continuous data
    var segments = areaData.reduce(function (segments, d) {
      // skip if this point has no data
      if (!defined(d)) {
        startNewSegment = true;
        return segments;
      }

      // if we are starting a new segment, start it with this point
      if (startNewSegment) {
        segments.push([d]);
        startNewSegment = false;

        // otherwise see if we are adding to the last segment
      } else {
        var lastSegment = segments[segments.length - 1];
        var lastDatum = lastSegment[lastSegment.length - 1];
        // if we expect this point to come next, add it to the segment
        if (isNext(lastDatum, d)) {
          lastSegment.push(d);

          // otherwise create a new segment
        } else {
          segments.push([d]);
        }
      }

      return segments;
    }, []);

    return segments;
  }

  /**
   * Helper function that applies attrs and styles to the specified selection.
   *
   * @param {Object} selection The d3 selection
   * @param {Object} evaluatedDefinition The evaluated styles and attrs obj (part of output from evaluateDefinitions())
   * @param {Boolean} point if true, uses pointAttrs and pointStyles, otherwise attrs and styles (default: false).
   * @return {void}
   */
  function applyAttrsAndStyles(selection, evaluatedDefinition) {
    var point = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var attrsKey = point ? 'pointAttrs' : 'attrs';
    var stylesKey = point ? 'pointStyles' : 'styles';

    // apply user-provided attrs
    Object.keys(evaluatedDefinition[attrsKey]).forEach(function (attr) {
      selection.attr(attr, evaluatedDefinition[attrsKey][attr]);
    });

    // apply user-provided styles
    Object.keys(evaluatedDefinition[stylesKey]).forEach(function (style) {
      selection.style(style, evaluatedDefinition[stylesKey][style]);
    });
  }

  /**
   * For the selected area, evaluate the definitions objects. This is necessary since
   * some of the style/attr values are functions that need to be evaluated per area.
   *
   * In general, the definitions are added in this order:
   *
   * 1. definition from areaStyle, areaAttrs, pointStyles, pointAttrs
   * 2. if it is the gap area, add in gapStyles, gapAttrs
   * 3. definition from chunkDefinitions
   *
   * Returns an object matching the form of chunkDefinitions:
   * {
   *   area: { styles, attrs, pointStyles, pointAttrs },
   *   gap: { styles, attrs }
   *   chunkName1: { styles, attrs, pointStyles, pointAttrs },
   *   ...
   * }
   */
  function evaluateDefinitions(d, i) {
    // helper to evaluate an object of attr or style definitions
    function evaluateAttrsOrStyles() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return Object.keys(input).reduce(function (output, key) {
        var val = input[key];

        if (typeof val === 'function') {
          val = val(d, i);
        }

        output[key] = val;
        return output;
      }, {});
    }

    var evaluated = {};

    // get the list of chunks to create evaluated definitions for
    var chunks = getChunkNames();

    // for each chunk, evaluate the attrs and styles to use for areas and points
    chunks.forEach(function (chunkName) {
      var chunkDef = chunkDefinitions[chunkName] || {};
      var evaluatedChunk = {
        styles: Object.assign({}, evaluateAttrsOrStyles(areaStyles), evaluateAttrsOrStyles((chunkDefinitions[areaChunkName] || {}).styles), chunkName === gapChunkName ? evaluateAttrsOrStyles(gapStyles) : undefined, evaluateAttrsOrStyles(chunkDef.styles)),
        attrs: Object.assign({}, evaluateAttrsOrStyles(areaAttrs), evaluateAttrsOrStyles((chunkDefinitions[areaChunkName] || {}).attrs), chunkName === gapChunkName ? evaluateAttrsOrStyles(gapAttrs) : undefined, evaluateAttrsOrStyles(chunkDef.attrs))
      };

      // set point attrs. defaults read from this chunk's area settings.
      var basePointAttrs = {
        fill: evaluatedChunk.attrs.fill,
        r: evaluatedChunk.attrs['stroke-width'] == null ? 2 : parseFloat(evaluatedChunk.attrs['stroke-width']) + 1
      };

      evaluatedChunk.pointAttrs = Object.assign(basePointAttrs, evaluateAttrsOrStyles(pointAttrs), evaluateAttrsOrStyles((chunkDefinitions[areaChunkName] || {}).pointAttrs), evaluateAttrsOrStyles(chunkDef.pointAttrs));

      // ensure `r` is a number (helps to remove 'px' if provided)
      if (evaluatedChunk.pointAttrs.r != null) {
        evaluatedChunk.pointAttrs.r = parseFloat(evaluatedChunk.pointAttrs.r);
      }

      // set point styles. if no fill attr set, use the area style stroke. otherwise read from the attr.
      var basePointStyles = chunkDef.pointAttrs && chunkDef.pointAttrs.fill != null ? {} : {
        fill: evaluatedChunk.styles.fill
      };

      evaluatedChunk.pointStyles = Object.assign(basePointStyles, evaluateAttrsOrStyles(pointStyles), evaluateAttrsOrStyles((chunkDefinitions[areaChunkName] || {}).pointStyles), evaluateAttrsOrStyles(chunkDef.pointStyles));

      evaluated[chunkName] = evaluatedChunk;
    });

    return evaluated;
  }

  /**
   * Render the points for when segments have length 1.
   */
  function renderCircles(initialRender, transition, context, root, points, evaluatedDefinition, className) {
    var primaryClassName = className.split(' ')[0];
    var circles = root.selectAll('.' + primaryClassName).data(points, function (d) {
      return d.id;
    });

    // read in properties about the transition if we have one
    var transitionDuration = transition ? context.duration() : 0;
    var transitionDelay = transition ? context.delay() : 0;

    // EXIT
    if (transition) {
      circles.exit().transition().delay(transitionDelay).duration(transitionDuration * 0.05).attr('r', 1e-6).remove();
    } else {
      circles.exit().remove();
    }

    // ENTER
    var circlesEnter = circles.enter().append('circle');

    // apply user-provided attrs, using attributes from current area if not provided
    applyAttrsAndStyles(circlesEnter, evaluatedDefinition, true);

    circlesEnter.classed(className, true).attr('r', 1e-6) // overrides provided `r value for now
    .attr('cx', function (d) {
      return x(d.data);
    }).attr('cy', function (d) {
      return y1(d.data);
    });

    // handle with transition
    if ((!initialRender || initialRender && transitionInitial) && transition) {
      var enterDuration = transitionDuration * 0.15;

      // delay sizing up the radius until after the area transition
      circlesEnter.transition(context).delay(transitionDelay + (transitionDuration - enterDuration)).duration(enterDuration).attr('r', evaluatedDefinition.pointAttrs.r);
    } else {
      circlesEnter.attr('r', evaluatedDefinition.pointAttrs.r);
    }

    // UPDATE
    if (transition) {
      circles = circles.transition(context);
    }
    circles.attr('r', evaluatedDefinition.pointAttrs.r).attr('cx', function (d) {
      return x(d.data);
    }).attr('cy', function (d) {
      return y1(d.data);
    });
  }

  function renderClipRects(initialRender, transition, context, root, segments, _ref, _ref2, evaluatedDefinition, path, clipPathId) {
    var _ref4 = slicedToArray(_ref, 2),
        xMin = _ref4[0],
        xMax = _ref4[1];

    var _ref3 = slicedToArray(_ref2, 2),
        yMin = _ref3[0],
        yMax = _ref3[1];

    // TODO: issue with assigning IDs to clipPath elements. need to update how we select/create them
    // need reference to path element to set stroke-width property
    var clipPath = root.select('#' + clipPathId);
    var gDebug = root.select('.d3-area-chunked-debug');

    // set up debug group
    if (debug && gDebug.empty()) {
      gDebug = root.append('g').classed('d3-area-chunked-debug', true);
    } else if (!debug && !gDebug.empty()) {
      gDebug.remove();
    }

    var clipPathRects = clipPath.selectAll('rect').data(segments);
    var debugRects = void 0;
    if (debug) {
      debugRects = gDebug.selectAll('rect').data(segments);
    }

    // get stroke width to avoid having the clip rects clip the stroke
    // See https://github.com/pbeshai/d3-line-chunked/issues/2
    var strokeWidth = parseFloat(evaluatedDefinition.styles['stroke-width'] || path.style('stroke-width') // reads from CSS too
    || evaluatedDefinition.attrs['stroke-width']);
    var strokeWidthClipAdjustment = strokeWidth;
    var clipRectY = yMin - strokeWidthClipAdjustment;
    var clipRectHeight = yMax + strokeWidthClipAdjustment - (yMin - strokeWidthClipAdjustment);

    // compute the currently visible area pairs of [xStart, xEnd] for each clip rect
    // if no clip rects, the whole area is visible.
    var visibleArea = void 0;

    if (transition) {

      // compute the start and end x values for a data point based on maximizing visibility
      // around the middle of the rect.
      var visibleStartEnd = function visibleStartEnd(d, visibleArea) {
        // eslint-disable-line no-inner-declarations
        var xStart = x(d[0]);
        var xEnd = x(d[d.length - 1]);
        var xMid = xStart + (xEnd - xStart) / 2;
        var visArea = visibleArea.find(function (area) {
          return area[0] <= xMid && xMid <= area[1];
        });

        // set width to overlapping visible area
        if (visArea) {
          return [Math.max(visArea[0], xStart), Math.min(xEnd, visArea[1])];
        }

        // return xEnd - xStart;
        return [xMid, xMid];
      };

      var exitRect = function exitRect(rect) {
        // eslint-disable-line no-inner-declarations
        rect.attr('x', function (d) {
          return visibleStartEnd(d, nextVisibleArea)[0];
        }).attr('width', function (d) {
          var _visibleStartEnd = visibleStartEnd(d, nextVisibleArea),
              _visibleStartEnd2 = slicedToArray(_visibleStartEnd, 2),
              xStart = _visibleStartEnd2[0],
              xEnd = _visibleStartEnd2[1];

          return xEnd - xStart;
        });
      };

      var enterRect = function enterRect(rect) {
        // eslint-disable-line no-inner-declarations
        rect.attr('x', function (d) {
          return visibleStartEnd(d, visibleArea)[0];
        }).attr('width', function (d) {
          var _visibleStartEnd3 = visibleStartEnd(d, visibleArea),
              _visibleStartEnd4 = slicedToArray(_visibleStartEnd3, 2),
              xStart = _visibleStartEnd4[0],
              xEnd = _visibleStartEnd4[1];

          return xEnd - xStart;
        }).attr('y', clipRectY).attr('height', clipRectHeight);
      };

      // select previous rects
      var previousRects = clipPath.selectAll('rect').nodes();
      // no previous rects = visible area is everything
      if (!previousRects.length) {
        visibleArea = [[xMin, xMax]];
      } else {
        visibleArea = previousRects.map(function (rect) {
          var selectedRect = d3Selection.select(rect);
          var xStart = parseFloat(selectedRect.attr('x'));
          var xEnd = parseFloat(selectedRect.attr('width')) + xStart;
          return [xStart, xEnd];
        });
      }

      // set up the clipping paths
      // animate by shrinking width to 0 and setting x to the mid point
      var nextVisibleArea = void 0;
      if (!segments.length) {
        nextVisibleArea = [[0, 0]];
      } else {
        nextVisibleArea = segments.map(function (d) {
          var xStart = x(d[0]);
          var xEnd = x(d[d.length - 1]);
          return [xStart, xEnd];
        });
      }

      clipPathRects.exit().transition(context).call(exitRect).remove();
      var clipPathRectsEnter = clipPathRects.enter().append('rect').call(enterRect);
      clipPathRects = clipPathRects.merge(clipPathRectsEnter);
      clipPathRects = clipPathRects.transition(context);

      // debug rects should match clipPathRects
      if (debug) {
        debugRects.exit().transition(context).call(exitRect).remove();
        var debugRectsEnter = debugRects.enter().append('rect').style('fill', 'rgba(255, 0, 0, 0.3)').style('stroke', 'rgba(255, 0, 0, 0.6)').call(enterRect);

        debugRects = debugRects.merge(debugRectsEnter);
        debugRects = debugRects.transition(context);
      }

      // not in transition
    } else {
      clipPathRects.exit().remove();
      var _clipPathRectsEnter = clipPathRects.enter().append('rect');
      clipPathRects = clipPathRects.merge(_clipPathRectsEnter);

      if (debug) {
        debugRects.exit().remove();
        var _debugRectsEnter = debugRects.enter().append('rect').style('fill', 'rgba(255, 0, 0, 0.3)').style('stroke', 'rgba(255, 0, 0, 0.6)');
        debugRects = debugRects.merge(_debugRectsEnter);
      }
    }

    // after transition, update the clip rect dimensions
    function updateRect(rect) {
      rect.attr('x', function (d) {
        // if at the edge, adjust for stroke width
        var val = x(d[0]);
        if (val === xMin) {
          return val - strokeWidthClipAdjustment;
        }
        return val;
      }).attr('width', function (d) {
        // if at the edge, adjust for stroke width to prevent clipping it
        var valMin = x(d[0]);
        var valMax = x(d[d.length - 1]);
        if (valMin === xMin) {
          valMin -= strokeWidthClipAdjustment;
        }
        if (valMax === xMax) {
          valMax += strokeWidthClipAdjustment;
        }

        return valMax - valMin;
      }).attr('y', clipRectY).attr('height', clipRectHeight);
    }

    clipPathRects.call(updateRect);
    if (debug) {
      debugRects.call(updateRect);
    }
  }

  /**
   * Helper function to draw the actual path
   */
  function renderPath(initialRender, transition, context, root, areaData, evaluatedDefinition, area, initialArea, className, clipPathId) {
    var path = root.select('.' + className.split(' ')[0]);

    // initial render
    if (path.empty()) {
      path = root.append('path');
    }
    var pathSelection = path;

    if (clipPathId) {
      path.attr('clip-path', 'url(#' + clipPathId + ')');
    }

    // handle animations for initial render
    if (initialRender) {
      path.attr('d', initialArea(areaData));
    }

    // apply user defined styles and attributes
    applyAttrsAndStyles(path, evaluatedDefinition);

    path.classed(className, true);

    // handle transition
    if (transition) {
      path = path.transition(context);
    }

    if (path.attrTween) {
      // use attrTween is available (in transition)
      path.attrTween('d', function dTween() {
        var previous = d3Selection.select(this).attr('d');
        var current = area(areaData);
        return d3InterpolatePath.interpolatePath(previous, current);
      });
    } else {
      path.attr('d', function () {
        return area(areaData);
      });
    }

    // can't return path since it might have the transition
    return pathSelection;
  }

  /**
   * Helper to get the area functions to use to draw the areas. Possibly
   * updates the area data to be in [x, y] format if extendEnds is true.
   *
   * @return {Object} { area, initialArea, areaData }
   */
  function getAreaFunctions(areaData, initialRender, yDomain) {
    // eslint-disable-line no-unused-vars
    // main area function
    var area = d3Shape.area().x(x).y0(y0).y1(y1).curve(curve);
    var initialArea = void 0;

    // if the user specifies to extend ends for the undefined area, add points to the area for them.
    if (extendEnds && areaData.length) {
      // we have to process the data here since we don't know how to format an input object
      // we use the [x, y] format of a data point
      var processedAreaData = areaData.map(function (d) {
        return [x(d), y1(d)];
      });
      areaData = [[extendEnds[0], processedAreaData[0][1]]].concat(toConsumableArray(processedAreaData), [[extendEnds[1], processedAreaData[processedAreaData.length - 1][1]]]);

      // this area function works on the processed data (default .x and .y read the [x,y] format)
      area = d3Shape.area().y0(y0).curve(curve);
    }

    // handle animations for initial render
    if (initialRender) {
      // have the area load in with a flat y value
      initialArea = area;
      if (transitionInitial) {
        initialArea = d3Shape.area().x(x).y0(y0).y1(y0).curve(curve);

        // if the user extends ends, we should use the area that works on that data
        if (extendEnds) {
          initialArea = d3Shape.area().y0(y0).y1(y0).curve(curve);
        }
      }
    }

    return {
      area: area,
      initialArea: initialArea || area,
      areaData: areaData
    };
  }

  function initializeClipPath(chunkName, root) {
    if (chunkName === gapChunkName) {
      return undefined;
    }

    var defs = root.select('defs');
    if (defs.empty()) {
      defs = root.append('defs');
    }

    // className = d3-area-chunked-clip-chunkName
    var className = 'd3-area-chunked-clip-' + chunkName;
    var clipPath = defs.select('.' + className);

    // initial render
    if (clipPath.empty()) {
      clipPath = defs.append('clipPath').attr('class', className).attr('id', 'd3-area-chunked-clip-' + chunkName + '-' + counter++);
    }

    return clipPath.attr('id');
  }

  /**
   * Render the areas: circles, paths, clip rects for the given (data, areaIndex)
   */
  function renderAreas(initialRender, transition, context, root, data, areaIndex) {
    // use the accessor if provided (e.g. if the data is something like
    // `{ results: [[x,y], [[x,y], ...]}`)
    var areaData = accessData(data);

    // filter to only defined data to plot the areas
    var filteredAreaData = areaData.filter(defined);

    // determine the extent of the y values
    var yExtent = d3Array.extent(filteredAreaData.map(function (d) {
      return y1(d);
    }));

    // determine the extent of the x values to handle stroke-width adjustments on
    // clipping rects. Do not use extendEnds here since it can clip the area ending
    // in an unnatural way, it's better to just show the end.
    var xExtent = d3Array.extent(filteredAreaData.map(function (d) {
      return x(d);
    }));

    // evaluate attrs and styles for the given dataset
    // pass in the raw data and index for computing attrs and styles if they are functinos
    var evaluatedDefinitions = evaluateDefinitions(data, areaIndex);

    // update area functions and data depending on animation and render circumstances
    var areaResults = getAreaFunctions(filteredAreaData, initialRender, yExtent);

    // areaData possibly updated if extendEnds is true since we normalize to [x, y] format
    var area = areaResults.area,
        initialArea = areaResults.initialArea,
        modifiedAreaData = areaResults.areaData;

    // for each chunk type, render a area

    var chunkNames = getChunkNames();

    var definedSegments = computeDefinedSegments(areaData);

    // for each chunk, draw a area, circles and clip rect
    chunkNames.forEach(function (chunkName) {
      var clipPathId = initializeClipPath(chunkName, root);

      var className = 'd3-area-chunked-chunk-' + chunkName;
      if (chunkName === areaChunkName) {
        className = 'd3-area-chunked-defined ' + className;
      } else if (chunkName === gapChunkName) {
        className = 'd3-area-chunked-undefined ' + className;
      }

      // get the eval defs for this chunk name
      var evaluatedDefinition = evaluatedDefinitions[chunkName];

      var path = renderPath(initialRender, transition, context, root, modifiedAreaData, evaluatedDefinition, area, initialArea, className, clipPathId);

      if (chunkName !== gapChunkName) {
        // compute the segments and points for this chunk type
        var segments = computeChunkedSegments(chunkName, definedSegments);
        var points = segments.filter(function (segment) {
          return segment.length === 1;
        }).map(function (segment) {
          return {
            // use random ID so they are treated as entering/exiting each time
            id: x(segment[0]),
            data: segment[0]
          };
        });

        var circlesClassName = className.split(' ').map(function (name) {
          return name + '-point';
        }).join(' ');
        renderCircles(initialRender, transition, context, root, points, evaluatedDefinition, circlesClassName);

        renderClipRects(initialRender, transition, context, root, segments, xExtent, [Math.min(yExtent[0], y0()), Math.max(yExtent[1], y0())], evaluatedDefinition, path, clipPathId);
      }
    });

    // ensure all circles are at the top
    root.selectAll('circle').raise();
  }

  // the main function that is returned
  function areaChunked(context) {
    if (!context) {
      return;
    }
    var selection = context.selection ? context.selection() : context; // handle transition

    if (!selection || selection.empty()) {
      return;
    }

    var transition = false;
    if (selection !== context) {
      transition = true;
    }

    selection.each(function each(data, areaIndex) {
      var root = d3Selection.select(this);

      var initialRender = root.select('.d3-area-chunked-defined').empty();
      renderAreas(initialRender, transition, context, root, data, areaIndex);
    });

    // provide warning about wrong attr/defs
    validateChunkDefinitions();
  }

  // ------------------------------------------------
  // Define getters and setters
  // ------------------------------------------------
  function getterSetter(_ref5) {
    var get = _ref5.get,
        set = _ref5.set,
        setType = _ref5.setType,
        asConstant = _ref5.asConstant;

    return function getSet(newValue) {
      if (arguments.length) {
        // main setter if setType matches newValue type
        if (!setType && newValue != null || setType && (typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) === setType) {
          set(newValue);

          // setter to constant function if provided
        } else if (asConstant && newValue != null) {
          set(asConstant(newValue));
        }

        return areaChunked;
      }

      // otherwise ignore value/no value provided, so use getter
      return get();
    };
  }

  // define `x([x])`
  areaChunked.x = getterSetter({
    get: function get() {
      return x;
    },
    set: function set(newValue) {
      x = newValue;
    },
    setType: 'function',
    asConstant: function asConstant(newValue) {
      return function () {
        return +newValue;
      };
    } // d3 v4 uses +, so we do too
  });

  // define `y0([y])`
  areaChunked.y0 = getterSetter({
    get: function get() {
      return y0;
    },
    set: function set(newValue) {
      y0 = newValue;
    },
    setType: 'function',
    asConstant: function asConstant(newValue) {
      return function () {
        return +newValue;
      };
    }
  });

  // define `y1([y])`
  areaChunked.y1 = getterSetter({
    get: function get() {
      return y1;
    },
    set: function set(newValue) {
      y1 = newValue;
    },
    setType: 'function',
    asConstant: function asConstant(newValue) {
      return function () {
        return +newValue;
      };
    }
  });

  // define `defined([defined])`
  areaChunked.defined = getterSetter({
    get: function get() {
      return defined;
    },
    set: function set(newValue) {
      defined = newValue;
    },
    setType: 'function',
    asConstant: function asConstant(newValue) {
      return function () {
        return !!newValue;
      };
    }
  });

  // define `isNext([isNext])`
  areaChunked.isNext = getterSetter({
    get: function get() {
      return isNext;
    },
    set: function set(newValue) {
      isNext = newValue;
    },
    setType: 'function',
    asConstant: function asConstant(newValue) {
      return function () {
        return !!newValue;
      };
    }
  });

  // define `chunk([chunk])`
  areaChunked.chunk = getterSetter({
    get: function get() {
      return chunk;
    },
    set: function set(newValue) {
      chunk = newValue;
    },
    setType: 'function',
    asConstant: function asConstant(newValue) {
      return function () {
        return newValue;
      };
    }
  });

  // define `chunkAreaResolver([chunkAreaResolver])`
  areaChunked.chunkAreaResolver = getterSetter({
    get: function get() {
      return chunkAreaResolver;
    },
    set: function set(newValue) {
      chunkAreaResolver = newValue;
    },
    setType: 'function'
  });

  // define `chunkDefinitions([chunkDefinitions])`
  areaChunked.chunkDefinitions = getterSetter({
    get: function get() {
      return chunkDefinitions;
    },
    set: function set(newValue) {
      chunkDefinitions = newValue;
    },
    setType: 'object'
  });

  // define `curve([curve])`
  areaChunked.curve = getterSetter({
    get: function get() {
      return curve;
    },
    set: function set(newValue) {
      curve = newValue;
    },
    setType: 'function'
  });

  // define `areaStyles([areaStyles])`
  areaChunked.areaStyles = getterSetter({
    get: function get() {
      return areaStyles;
    },
    set: function set(newValue) {
      areaStyles = newValue;
    },
    setType: 'object'
  });

  // define `gapStyles([gapStyles])`
  areaChunked.gapStyles = getterSetter({
    get: function get() {
      return gapStyles;
    },
    set: function set(newValue) {
      gapStyles = newValue;
    },
    setType: 'object'
  });

  // define `pointStyles([pointStyles])`
  areaChunked.pointStyles = getterSetter({
    get: function get() {
      return pointStyles;
    },
    set: function set(newValue) {
      pointStyles = newValue;
    },
    setType: 'object'
  });

  // define `areaAttrs([areaAttrs])`
  areaChunked.areaAttrs = getterSetter({
    get: function get() {
      return areaAttrs;
    },
    set: function set(newValue) {
      areaAttrs = newValue;
    },
    setType: 'object'
  });

  // define `gapAttrs([gapAttrs])`
  areaChunked.gapAttrs = getterSetter({
    get: function get() {
      return gapAttrs;
    },
    set: function set(newValue) {
      gapAttrs = newValue;
    },
    setType: 'object'
  });

  // define `pointAttrs([pointAttrs])`
  areaChunked.pointAttrs = getterSetter({
    get: function get() {
      return pointAttrs;
    },
    set: function set(newValue) {
      pointAttrs = newValue;
    },
    setType: 'object'
  });

  // define `transitionInitial([transitionInitial])`
  areaChunked.transitionInitial = getterSetter({
    get: function get() {
      return transitionInitial;
    },
    set: function set(newValue) {
      transitionInitial = newValue;
    },
    setType: 'boolean'
  });

  // define `extendEnds([extendEnds])`
  areaChunked.extendEnds = getterSetter({
    get: function get() {
      return extendEnds;
    },
    set: function set(newValue) {
      extendEnds = newValue;
    },
    setType: 'object' // should be an array
  });

  // define `accessData([accessData])`
  areaChunked.accessData = getterSetter({
    get: function get() {
      return accessData;
    },
    set: function set(newValue) {
      accessData = newValue;
    },
    setType: 'function',
    asConstant: function asConstant(newValue) {
      return function (d) {
        return d[newValue];
      };
    }
  });

  // define `debug([debug])`
  areaChunked.debug = getterSetter({
    get: function get() {
      return debug;
    },
    set: function set(newValue) {
      debug = newValue;
    },
    setType: 'boolean'
  });

  return areaChunked;
}

exports.areaChunked = areaChunked;

Object.defineProperty(exports, '__esModule', { value: true });

})));