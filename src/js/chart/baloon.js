import { round, throttle, debounce, FPS_60, addEventListeners, getGraphsValuesRange, getColumnWidth, getScaling } from '../utils/utils';
import { MARGIN_TOP, MARGIN_BOTTOM, MARGINS } from './chart';

export class Balloon {
  constructor(chart) {
    this.chart = chart;

    this.initElements();
    this.addEventListeners();
  }

  initElements() {
    this.canvas = document.createElement('canvas');
    this.updateCanvasStyles();
    this.ctx = this.canvas.getContext('2d');

    this.chart.canvas.insertAdjacentElement('afterend', this.canvas);

    this.balloon = document.createElement('div');
    this.balloon.classList.add('balloon');
    this.balloon.id = 'balloon' + this.chart.uniqueId;
    this.balloon.innerHTML = `
      <div class="balloon__header"></div>
      <div class="balloon__content"></div>
    `;

    document.body.appendChild(this.balloon);
  }

  getIndexByCoords(x) {
    const range = this.chart.timeline.range;
    const columnWidth = getColumnWidth(this.chart.canvas.width, null, range);

    const indexInRange = round(x / columnWidth);

    return {
      global: range.start + indexInRange,
      inRange: indexInRange
    };
  }

  addEventListeners() {
    const onMouseMoveThrottled = throttle((event) => {
      event.stopImmediatePropagation();

      this.updateBalloon(event.layerX, event.layerY);
      this.drawLine(event.layerX, event.layerY);
      this.drawDots(event.layerX, event.layerY);
    }, FPS_60);

    const onMouseLeaveDebounced = debounce((event) => {
      event.stopImmediatePropagation();

      this.balloon.style.display = 'none';
      this.clearCanvas();
    }, FPS_60);

    addEventListeners(this.canvas, 'mousemove touchmove', onMouseMoveThrottled);

    addEventListeners(this.canvas, 'mouseenter touchstart', (event) => {
      event.stopImmediatePropagation();

      this.balloon.style.display = 'flex';
    });

    addEventListeners(this.canvas, 'mouseleave touchend', onMouseLeaveDebounced);
  }

  drawDots(x, y) {
    const index = this.getIndexByCoords(x);
    const range = this.chart.timeline.range;
    const visibleGraphs = this.chart.getGraphs(true);
    const graphsValuesRange = getGraphsValuesRange(visibleGraphs, range);
    const scaling = getScaling(this.chart.canvas.height - MARGINS, graphsValuesRange);
    const columnWidth = getColumnWidth(this.chart.canvas.width, null, range);

    Object.keys(visibleGraphs).forEach((key) => {
      const dotX = index.inRange * columnWidth;
      const dotY = round(this.canvas.height - MARGIN_BOTTOM - (this.chart.model[key].columns[index.global] * scaling));

      this.ctx.fillStyle = document.body.classList.contains('_night') ? '#242f3e' : '#fff';
      this.ctx.strokeStyle = this.chart.model[key].lineColor;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(dotX, dotY, 5, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  updateBalloon(x) {
    const canvasRect = this.canvas.getBoundingClientRect();
    const balloonRect = this.balloon.getBoundingClientRect();

    let correctX = canvasRect.left + x;
    let newX = correctX - (balloonRect.width / 2);

    if (x <= canvasRect.left + balloonRect.width) {
      this.balloon.style.left = round(correctX) + 'px';
    } else if (x >= canvasRect.width - balloonRect.width) {
      this.balloon.style.left = round(correctX - balloonRect.width)  + 'px';
    } else {
      this.balloon.style.left = round(newX) + 'px';
    }

    this.balloon.style.top = (canvasRect.top - 10) + 'px';

    const index = this.getIndexByCoords(x).global;

    const options = {
      date: null,
      graphs: []
    };

    Object.keys(this.chart.model).forEach((key) => {
      if (!this.chart.model[key].visible) { return; }

      if (key === 'x') {
        options.date = this.chart.model[key].columns[index];
        return;
      }

      options.graphs.push({
        name: this.chart.model[key].name,
        lineColor: this.chart.model[key].lineColor,
        value: this.chart.model[key].columns[index]
      });
    });

    const date = new Date(options.date).toLocaleDateString(navigator.language || navigator.userLanguage, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const balloonContent = this.balloon.querySelector('.balloon__content');

    this.balloon.querySelector('.balloon__header').innerHTML = date;
    balloonContent.innerHTML = '';

    options.graphs.forEach((graph) => {
      const item = document.createElement('div');
      item.classList.add('balloon__item');

      item.innerHTML = `
        <b>${graph.value.toLocaleString()}</b>
        <b>${graph.name}</b>
      `;

      item.style.color = graph.lineColor;

      balloonContent.appendChild(item);
    });
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawLine(x) {
    this.clearCanvas();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(221, 234, 243, 0.7)';
    this.ctx.beginPath();
    this.ctx.moveTo(x, this.canvas.height - MARGIN_BOTTOM);
    this.ctx.lineTo(x, MARGIN_TOP);
    this.ctx.stroke();
  }

  updateCanvasStyles() {
    const chartCanvasStyle = getComputedStyle(this.chart.canvas);

    this.canvas.width = this.chart.canvas.width;
    this.canvas.height = this.chart.canvas.height;

    this.canvas.style.position = 'absolute';
    // this.canvas.style.pointerEvents = 'none';
    this.canvas.style.left = 0 + 'px';
    this.canvas.style.top = 0 + 'px';
    this.canvas.style.zIndex = parseInt(chartCanvasStyle.zIndex, 10) + 1;
    // this.canvas.style.border = '1px solid red';
  }

  onViewportResize() {
    this.updateCanvasStyles();
    this.clearCanvas();
  }

  onColorModeChange() {
    this.balloon.classList.toggle('balloon_night');
  }
}
