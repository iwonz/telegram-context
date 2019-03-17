import { Timeline } from './timeline';

import { getGraphsValuesRange, drawLine, drawText } from '../utils/utils';

export class Chart {
  constructor(config) {
    this.config = Object.assign({}, {
      selector: '#chart',
      marginTop: 20,
      marginBottom: 40,
      fontSize: 16,
      sections: {
        x: 6,
        y: 6
      },
      timeline: {
        enabled: true,
        selector: '#timeline'
      },
      data: null
    }, config);

    this.model = this.getModel(this.config.data);

    this.canvas = document.querySelector(this.config.selector);
    this.updateCanvasSize();
    this.ctx = this.canvas.getContext('2d');

    if (config.timeline.enabled) {
      this.timeline = new Timeline(this, {
        ...this.config.timeline,
        onRangeChange: () => {
          this.draw();
        }
      });
    }

    this.draw();
  }

  updateCanvasSize() {
    this.canvas.width = this.canvas.parentNode.offsetWidth;
    this.canvas.height = this.canvas.parentNode.offsetHeight * 0.4;
  }

  getModel(data) {
    return data.columns.reduce((model, column) => {
      model[column[0]] = {
        columns: column.slice(1),
        type: data.types[column[0]],
        name: data.names[column[0]],
        lineColor: data.colors[column[0]],
        visible: true
      };

      return model;
    }, {});
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawYLines();
    this.drawGraphs();
    this.drawYValues();
  }

  /**
   * Return only visible graphs
   */
  getVisibleGraphs() {
    return Object.keys(this.model).reduce((graphs, key) => {
      if (key !== 'x' && this.model[key].visible) {
        graphs[key] = this.model[key];
      }

      return graphs;
    }, {});
  }

  getGraphs() {
    return Object.keys(this.model).reduce((graphs, key) => {
      if (key !== 'x') {
        graphs[key] = this.model[key];
      }

      return graphs;
    }, {});
  }

  drawGraphs() {
    const range = this.timeline.getRange();
    const graphs = this.getVisibleGraphs();
    const margins = this.config.marginTop - this.config.marginBottom;
    const coef = (this.canvas.height - margins) / getGraphsValuesRange(graphs).max;

    Object.keys(graphs).forEach((key) => {
      const columns = this.model[key].columns.slice(range.start, range.end);
      const columnWidth = this.canvas.width / columns.length;

      let x = 0;

      for (let i = 0; i < columns.length - 1; i++) {
        drawLine(
          this.ctx,
          x,
          this.canvas.height - columns[i] * coef,
          x + columnWidth,
          this.canvas.height - columns[i + 1] * coef,
          this.model[key].lineColor,
          3
        );

        // TODO: REMOVE
        const measure = this.ctx.measureText(columns[i]);
        drawText(this.ctx, columns[i], x - measure.width / 2, this.canvas.height - columns[i] * coef - this.config.marginTop + this.config.fontSize + 2, this.config.fontSize, this.model[key].lineColor);

        x += columnWidth;
      }
    });
  }

  drawYLines() {
    const margins = this.config.marginBottom + this.config.marginTop;
    let heightByDelimiter = (this.canvas.height - margins) / (this.config.sections.y - 1);

    for (let i = 0; i < this.config.sections.y; i++) {
      let x = 0,
          y = heightByDelimiter * i + this.config.marginTop;

      drawLine(this.ctx, x, y, this.canvas.width, y, '#f2f4f5');
    }
  }

  /**
   * Draw Y axis
   */
  drawYValues() {
    const valuesRanges = getGraphsValuesRange(this.getVisibleGraphs());

    let value = valuesRanges.max;

    const margins = this.config.marginBottom + this.config.marginTop;
    let heightByDelimiter = (this.canvas.height - margins) / (this.config.sections.y - 1);
    let valueByDelimiter = (Math.abs(valuesRanges.min) + valuesRanges.max) / this.config.sections.y;

    for (let i = 0; i < this.config.sections.y; i++) {
      let x = 0,
        y = heightByDelimiter * i + this.config.marginTop;

      drawText(this.ctx, value, x, y - 5, this.config.fontSize, '#546778');

      value = Math.floor(value - valueByDelimiter);

      if (value < valueByDelimiter) { value = 0; }
    }
  }

  onViewportResize() {
    this.updateCanvasSize();

    this.draw();
  }
}
