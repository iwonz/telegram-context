const FPS_60 = 1000 / 60;

export function getGraphsValuesRange(charts) {
  let minValue = 0;
  let maxValue = 0;

  Object.keys(charts).forEach((key) => {
    const { min, max } = getGraphValuesRange(charts[key]);

    minValue = min < minValue ? min : minValue;
    maxValue = max > maxValue ? max : maxValue;
  });

  if (minValue > 0) { minValue = 0; }

  return { min: minValue, max: maxValue };
}

export function getGraphValuesRange(graph) {
  let min = Math.min(...graph.columns);
  let max = Math.max(...graph.columns);

  if (min > 0) { min = 0; }

  return { min, max };
}

/**
 * Draw text
 * @param {Object} ctx - canvas context
 * @param {string} text - text to draw
 * @param {number} x - text x position
 * @param {number} y - text y position
 * @param {number} fontSize - font size (without measure)
 * @param {*} color - font color (hex, html, rgb, rgba)
 * @param {string} font - font family
 */
export function drawText(ctx, text, x, y, fontSize, color, font = 'Arial, Tahoma') {
  ctx.font = `${fontSize}px ${font}`;
  ctx.fillStyle = color;

  ctx.fillText(text, x, y);
}

function addEventListeners(element, events, cb) {
  events.split(' ').forEach((event) => {
    element.addEventListener(event, cb);
  });
}

function removeEventListeners(element, events, cb) {
  events.split(' ').forEach((event) => {
    element.removeEventListener(event, cb);
  });
}

export function throttle(fn, ms) {
  let isThrottled = false,
    lastArgs,
    lastThis;

  function wrp() {
    if (isThrottled) {
      lastArgs = arguments;
      lastThis = this;
      return;
    }

    fn.apply(this, arguments);

    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;

      if (lastArgs) {
        wrp.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
      }
    }, ms);
  }

  return wrp;
}

export function addDragListener(element, cb) {
  let beginEvent = null;

  const throttledOnMouseMove = throttle(onMouseMove, FPS_60);
  const throttledOnMouseUp = throttle(onMouseUp, FPS_60);

  function onMouseMove(event) {
    if (beginEvent === null) { return; }

    if (cb(beginEvent.pageX - event.pageX) === false) { return; }

    beginEvent = event;
  }

  function onMouseUp() {
    removeEventListeners(document, 'mousemove touchmove', throttledOnMouseMove);
    removeEventListeners(document, 'mouseup touchend', throttledOnMouseUp);

    beginEvent = null;
  }

  addEventListeners(element, 'mousedown touchstart', (event) => {
    event.stopImmediatePropagation();
    beginEvent = event;

    addEventListeners(document, 'mousemove touchmove', throttledOnMouseMove);
    addEventListeners(document, 'mouseup touchend', throttledOnMouseUp);
  });
}

export function drawGraph({
                            canvas,
                            ctx,
                            graph,
                            range,
                            marginTop,
                            marginBottom,
                            graphsValuesRange
                          } = {}) {
  const margins = marginTop + marginBottom;
  const scaling = (canvas.height - margins) / graphsValuesRange.max;

  const columns = range
    ? graph.columns.slice(range.start, range.end)
    : graph.columns;

  const columnWidth = canvas.width / (columns.length);

  console.group('Draw graph');
  console.log('Columns:', columns);
  console.log('Column width:', columnWidth);
  console.log('Margins:', margins);
  console.log('Scaling', scaling);
  console.groupEnd();

  let x = 0;

  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = graph.lineColor;

  ctx.beginPath();

  ctx.moveTo(x, round(canvas.height - marginBottom - (columns[0] * scaling)));

  for (let i = 0; i < columns.length; i++) {
    ctx.lineTo(x + columnWidth, round(canvas.height - marginBottom - (columns[i] * scaling)));
    x += columnWidth;

    // TODO: REMOVE
    const measure = ctx.measureText(columns[i]);
    drawText(ctx, columns[i], x - measure.width / 2, canvas.height - marginBottom - (columns[i] * scaling) - 10, 14, graph.lineColor);
  }

  ctx.stroke();
}

export function round(num) {
  return (0.5 + num) << 0;
}
