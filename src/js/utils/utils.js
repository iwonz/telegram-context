export function getGraphsValuesRange(charts) {
  let minValue = 0;
  let maxValue = 0;

  Object.keys(charts).forEach((key) => {
    const min = Math.min(...charts[key].columns);
    const max = Math.max(...charts[key].columns);

    minValue = min < minValue ? min : minValue;
    maxValue = max > maxValue ? max : maxValue;
  });

  if (minValue > 0) { minValue = 0; }

  return { min: minValue, max: maxValue };
}

/**
 * Draw line
 * @param {Object} ctx - canvas context
 * @param {number} fromX - moveToX
 * @param {number} fromY - moveToY
 * @param {number} toX - lineToX
 * @param {number} toY - lineY
 * @param {*} color - line color (hex, html, rgb, rgba)
 * @param {number} lineWidth - line width
 */
export function drawLine(ctx, fromX = 0, fromY = 0, toX, toY, color = 'black', lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.stroke();
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

export function addDragListener(element, cb) {
  let beginEvent = null;

  addEventListeners(element, 'mousedown touchstart', (event) => {
    event.stopPropagation();
    beginEvent = event;

    addEventListeners(document, 'mousemove touchmove', onMouseMove);
    addEventListeners(document, 'mouseup touchend', onMouseUp);
  });

  function onMouseMove(event) {
    if (beginEvent === null) { return; }

    cb(beginEvent.pageX - event.pageX);

    beginEvent = event;
  }

  function onMouseUp() {
    removeEventListeners(document, 'mousemove touchmove', onMouseMove);
    removeEventListeners(document, 'mouseup touchend', onMouseUp);

    beginEvent = null;
  }
}
