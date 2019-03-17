import { getGraphsValuesRange, drawLine, addDragListener } from '../utils/utils';

export class Timeline {
  constructor(chart, config) {
    this.chart = chart;

    this.config = Object.assign({}, {
      selector: '#timeline',
      marginTop: 4,
      marginBottom: 4,
      controller: {
        selector: '.timeline__controller',
      },
      height: 80
    }, config);

    this.canvas = document.querySelector(this.config.selector);
    this.updateCanvasSize();
    this.ctx = this.canvas.getContext('2d');

    this.controller = document.querySelector(this.config.controller.selector);
    this.shadowLeft = document.querySelector('.timeline__shadow_left');
    this.shadowRight = document.querySelector('.timeline__shadow_right');
    this.resizeLeft = document.querySelector('.timeline__controller-resize_left');
    this.resizeRight = document.querySelector('.timeline__controller-resize_right');

    this.addEventListeners();

    this.draw();
  }

  draw() {
    this.drawGraphs();
    this.updateShadows();
  }

  updateCanvasSize() {
    this.canvas.width = this.canvas.parentNode.offsetWidth;
    this.canvas.height = this.chart.canvas.height * 0.25;
  }

  onRangeChanged() {
    this.updateShadows();

    this.config.onRangeChange(this.getRange());
  }

  addEventListeners() {
    addDragListener(this.controller, (delta) => {
      const maxControllerRight = this.canvas.width - this.controller.offsetWidth;
      const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);
      let newControllerRight = controllerRight + delta;

      if (newControllerRight <= 0) { newControllerRight = 0; }
      if (newControllerRight >= maxControllerRight) { newControllerRight = maxControllerRight; }

      this.controller.style.right = newControllerRight + 'px';

      this.onRangeChanged();
    });

    addDragListener(this.resizeLeft, (delta, ) => {
      const newControllerWidth = this.controller.offsetWidth + delta;

      const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);

      if (controllerRight + newControllerWidth > this.canvas.width || newControllerWidth <= this.canvas.width * (1 / 6)) { return; }

      this.controller.style.width = newControllerWidth + 'px';

      this.onRangeChanged();
    });

    addDragListener(this.resizeRight, (delta) => {
      const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);
      const newControllerWidth = this.controller.offsetWidth - delta;
      const widthDiff = this.controller.offsetWidth - newControllerWidth;
      const newRight = controllerRight + widthDiff;

      if (newRight < 0 || newControllerWidth <= this.canvas.width * (1 / 6)) { return; }

      this.controller.style.right = newRight + 'px';
      this.controller.style.width = newControllerWidth + 'px';

      this.onRangeChanged();
    });
  }

  updateShadows() {
    const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);

    this.shadowLeft.style.width = this.canvas.width - controllerRight - this.controller.offsetWidth + 'px';
    this.shadowRight.style.width = controllerRight + 'px';
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
    const coef = (this.canvas.height - this.config.marginBottom - this.config.marginTop) / getGraphsValuesRange(graphs).max;

    Object.keys(graphs).forEach((key) => {
      let x = 0;

      for (let i = 0; i < this.chart.model[key].columns.length - 1; i++) {
        drawLine(
          this.ctx,
          x,
          this.canvas.height - this.chart.model[key].columns[i] * coef  - this.config.marginBottom,
          x + columnWidth,
          this.canvas.height - this.chart.model[key].columns[i + 1] * coef  - this.config.marginBottom,
          this.chart.model[key].lineColor,
          2
        );

        x += columnWidth;
      }
    });
  }

  onViewportResize() {
    this.updateCanvasSize();

    this.draw();
  }
}
