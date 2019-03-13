export function getGraphsMaxValue(charts) {
  let maxValue = 0;

  Object.keys(charts).forEach((key) => {
    const max = Math.max(...charts[key].columns);

    if (max > maxValue) {
      maxValue = max;
    }
  });

  return maxValue;
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
