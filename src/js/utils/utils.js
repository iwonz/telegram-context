export const FPS_60 = 1000 / 60;

export function getGraphsValuesRange(graphs, range) {
  let minValues = [0];
  let maxValues = [];

  Object.keys(graphs).forEach((key) => {
    const { min, max } = getGraphValuesRange(graphs[key], range);

    minValues.push(min);
    maxValues.push(max);
  });

  let min = Math.min.apply(Math, minValues);
  let max = Math.max.apply(Math, maxValues);

  return { min, max };
}

export function getGraphValuesRange(graph, range) {
  const columns = range
    ? graph.columns.slice(range.start, range.end)
    : graph.columns;

  let min = Math.min.apply(Math, columns);
  let max = Math.max.apply(Math, columns);

  // if (min > 0) { min = 0; }

  return { min, max };
}

export function drawText(ctx, text, x, y, fontSize, color, font) {
  font = font || 'Arial, Tahoma';

  ctx.font = `${fontSize}px ${font}`;
  ctx.fillStyle = color;

  ctx.fillText(text, x, y);
}

export function addEventListeners(element, events, cb) {
  events.split(' ').forEach((event) => {
    element.addEventListener(event, cb);
  });
}

export function removeEventListeners(element, events, cb) {
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

export function debounce(f, ms) {
  let timer = null;

  return function () {
    const args = [].slice.call(arguments);

    const onComplete = () => {
      f.apply(this, args);
      timer = null;
    };

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(onComplete, ms);
  };
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

export function getGraphDrawer(context) {
  const canvas = context.canvas;
  const ctx = context.ctx;

  return function ({
                     graph,
                     range,
                     marginTop,
                     marginBottom,
                     graphsValuesRange,
                     lineWidth
                   } = {}) {
    const scaling = getScaling(canvas.height - (marginTop + marginBottom), graphsValuesRange);

    const columns = range
      ? graph.columns.slice(range.start, range.end)
      : graph.columns;

    const columnWidth = getColumnWidth(canvas.width, columns);
    const startFrom = canvas.height - marginBottom;

    let x = 0;

    ctx.lineWidth = lineWidth || 1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = graph.lineColor;

    ctx.beginPath();
    ctx.moveTo(x, round(startFrom - columns[0] * scaling));

    for (let i = 1; i < columns.length; i++) {
      ctx.lineTo(x + columnWidth, round(startFrom - (columns[i] * scaling)));

      x += columnWidth;

      // TODO: REMOVE
      // drawText(ctx, columns[i], x, round(canvasHeight - columns[i] * scaling), 14, '#000');
    }

    ctx.stroke();
  }
}

export function round(num) {
  return (0.5 + num) << 0;
}

export function getColumnWidth(width, columns, range) {
  return width / (range ? Math.abs(range.end - range.start) - 1 : columns.length - 1);
}

export function getScaling(height, range) {
  return height / range.max;
}
