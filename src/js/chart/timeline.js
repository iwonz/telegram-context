import { getGraphsValuesRange, addDragListener, getGraphDrawer } from '../utils/utils';

const MARGIN_TOP = 4;
const MARGIN_BOTTOM = 4;

export class Timeline {
  constructor(chart, config) {
    this.chart = chart;
    this.config = config;

    this.range = {};

    this.initElements();
    this.addEventListeners();
    this.draw();
    this.updateRange();
  }

  initElements() {
    const chartWrapper = document.querySelector(this.chart.selector);
    this.canvas = chartWrapper.querySelector('.tl-canvas');
    this.updateCanvasSize();
    this.ctx = this.canvas.getContext('2d');

    this.controller = chartWrapper.querySelector('.tl__ctrl');
    this.shadowLeft = chartWrapper.querySelector('.tl__shadow_lt');
    this.shadowRight = chartWrapper.querySelector('.tl__shadow_rt');
    this.resizeLeft = chartWrapper.querySelector('.tl__ctrl-resize_lt');
    this.resizeRight = chartWrapper.querySelector('.tl__ctrl-resize_rt');
  }

  draw() {
    requestAnimationFrame(() => this.drawGraphs());
    requestAnimationFrame(() => this.updateShadows());
  }

  updateCanvasSize() {
    this.canvas.width = this.canvas.parentNode.offsetWidth;
    this.canvas.height = Math.max(window.innerHeight * 0.15, 70);
  }

  onRangeChanged() {
    this.updateShadows();
    this.updateRange();

    this.config.onRangeChange(this.range);
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

    addDragListener(this.resizeLeft, (delta) => {
      const newControllerWidth = this.controller.offsetWidth + delta;

      const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);

      if (controllerRight + newControllerWidth > this.canvas.width || newControllerWidth <= this.canvas.width * (1 / 4)) { return false; }

      this.controller.style.width = newControllerWidth + 'px';

      this.onRangeChanged();
    });

    addDragListener(this.resizeRight, (delta) => {
      const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);
      const newControllerWidth = this.controller.offsetWidth - delta;
      const widthDiff = this.controller.offsetWidth - newControllerWidth;
      const newRight = controllerRight + widthDiff;

      if (newRight < 0 || newControllerWidth <= this.canvas.width * (1 / 4)) { return false; }

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

  updateRange() {
    const controllerRight = parseInt(getComputedStyle(this.controller).right, 10);
    const controllerWidth = this.controller.offsetWidth;

    const columnWidth = this.canvas.width / this.chart.model.x.columns.length;

    const range = {
      from: this.canvas.width - controllerRight - controllerWidth,
      to: this.canvas.width - controllerRight
    };

    const start = Math.floor(range.from / columnWidth);
    const end = start + Math.ceil(controllerWidth / columnWidth);

    this.range = { start, end };
  }

  drawGraphs() {
    const drawGraph = getGraphDrawer(this);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const graphs = this.chart.getGraphs(true);
    const graphsValuesRange = getGraphsValuesRange(graphs);

    Object.keys(graphs).forEach((key) => {
      drawGraph({
        graph: graphs[key],
        marginTop: MARGIN_TOP,
        marginBottom: MARGIN_BOTTOM,
        graphsValuesRange,
        lineWidth: 2
      });
    });
  }

  onViewportResize() {
    this.updateCanvasSize();
    this.controller.style.right = '0px';

    this.draw();
  }
}
