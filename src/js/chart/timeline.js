import { getGraphsMaxValue, drawLine } from '../utils/utils';

export class Timeline {
  constructor(chart, config) {
    this._controllerHooked = null;

    this.chart = chart;

    this.config = Object.assign({}, {
      selector: '#timeline',
      controller: {
        selector: '.timeline__controller',
      },
      height: 80
    }, config);

    this.canvas = document.querySelector(this.config.selector);
    this.canvas.width = this.canvas.parentNode.offsetWidth;
    this.canvas.height = this.config.height;
    this.ctx = this.canvas.getContext('2d');

    this.controller = document.querySelector(this.config.controller.selector);

    this.addEventListeners();

    this.drawGraphs();
  }

  addEventListeners() {
    this.controller.addEventListener('mousedown', (event) => this._controllerHooked = event.pageX);

    this.controller.addEventListener('mousemove', (event) => {
      if (this._controllerHooked === null) { return; }

      const maxControllerRight = this.canvas.width - this.controller.offsetWidth;
      const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);
      let newControllerRight = controllerRight + (this._controllerHooked - event.pageX);

      if (newControllerRight <= 0) { newControllerRight = 0; }
      if (newControllerRight >= maxControllerRight) { newControllerRight = maxControllerRight; }

      this.controller.style.right = newControllerRight + 'px';
      this._controllerHooked = event.pageX;

      this.config.onRangeChange(this.getRange());
    });

    this.controller.addEventListener('mouseout', () => this._controllerHooked = null);
    this.controller.addEventListener('mouseup', () => this._controllerHooked = null);
  }

  getColumnWidth() {
    return this.canvas.width / this.chart.model.x.columns.length;
  }

  getRange() {
    const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);
    const controllerWidth = this.controller.offsetWidth;

    const columnWidth = this.getColumnWidth();

    const range = {
      from: this.canvas.width - controllerRight - controllerWidth,
      to: this.canvas.width - controllerRight
    };

    const start = Math.floor(range.from / columnWidth);
    const end = start + Math.floor(controllerWidth / columnWidth);

    return { start, end };
  }

  drawGraphs() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const graphs = this.chart.getVisibleGraphs();
    const columnWidth = this.getColumnWidth();
    const coef = this.canvas.height / getGraphsMaxValue(graphs);

    Object.keys(graphs).forEach((key) => {
      let x = 0;

      for (let i = 0; i < this.chart.model[key].columns.length - 1; i++) {
        drawLine(
          this.ctx,
          x,
          this.canvas.height - this.chart.model[key].columns[i] * coef,
          x + columnWidth,
          this.canvas.height - this.chart.model[key].columns[i + 1] * coef,
          this.chart.model[key].lineColor,
          3
        );

        x += columnWidth;
      }
    });
  }
}
