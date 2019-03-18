import { Timeline } from './timeline';

import { getGraphsValuesRange, drawText, drawGraph, round, animate } from '../utils/utils';

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
    let scale = 0;
    this.ctx.scale(0, 0);
    animate(() => {
      scale += 0.01;

      this.ctx.scale(2, 2);
    }, () => {
      this.ctx.scale(0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.drawYLines();
      this.drawGraphs();
      this.drawYValues();
    }, 100);
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
    const graphs = this.getVisibleGraphs();
    const graphsValuesRange = getGraphsValuesRange(graphs);

    Object.keys(graphs).forEach((key) => {
      drawGraph({
        canvas: this.canvas,
        ctx: this.ctx,
        graph: graphs[key],
        range: this.timeline.getRange(),
        marginTop: this.config.marginTop,
        marginBottom: this.config.marginBottom,
        graphsValuesRange
      });
    });
  }

  drawYLines() {
    const margins = this.config.marginBottom + this.config.marginTop;
    let heightByDelimiter = (this.canvas.height - margins) / (this.config.sections.y - 1);

    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'rgba(242, 244, 245, 1)';
    // this.ctx.strokeStyle = '#000';

    for (let i = 0; i < this.config.sections.y; i++) {
      let x = 0,
          y = round(heightByDelimiter * i + this.config.marginTop);

      console.log(y, heightByDelimiter);

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
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
        y = round(heightByDelimiter * i + this.config.marginTop);

      drawText(this.ctx, value.toLocaleString(), x, y - 5, this.config.fontSize, '#546778');

      value = round(value - valueByDelimiter);

      if (value <= valueByDelimiter) { value = 0; }
    }
  }

  toggleGraphVisible(graphName, isVisible = true) {
    Object.keys(this.model).forEach((key) => {
      if (key === graphName) {
        this.model[key].visible = isVisible;
      }
    }, {});

    this.draw();

    this.timeline && this.timeline.draw();
  }

  onViewportResize() {
    this.updateCanvasSize();

    this.draw();

    this.timeline && this.timeline.onViewportResize();
  }
}
