import { Timeline } from './timeline';
import { Balloon } from './baloon';

import { getGraphsValuesRange, drawText, getGraphDrawer, round, debounce } from '../utils/utils';

export const MARGIN_TOP = 20;
export const MARGIN_BOTTOM = 30;
export const MARGINS = MARGIN_TOP + MARGIN_BOTTOM;
const FONT_SIZE = 16;
const X_VALUES = 6;
const Y_VALUES = 6;

let uniqueId = 0;

export class Chart {
  constructor(config) {
    this.uniqueId = ++uniqueId;
    this.selector = '#chart-' + this.uniqueId;

    this.config = config;

    this.model = this.getModel(this.config.data);

    this.drawTemplate();

    requestAnimationFrame(() => {
      this.initElements();
      this.draw();
    });
  }

  onViewportResize = debounce(() => {
    this.updateCanvasSize();
    this.draw();

    this.timeline.onViewportResize();
    this.balloon.onViewportResize();
  }, 100);

  drawTemplate() {
    const chart = document.createElement('div');

    chart.classList.add('chart');
    chart.id = this.selector.slice(1);

    chart.innerHTML = document.querySelector('.chart-template').innerHTML;

    document.querySelector(this.config.appendTo || 'body').appendChild(chart);
  }

  initElements() {
    this.wrapper = document.querySelector(this.selector);
    this.canvas = this.wrapper.querySelector('.chart-canvas');
    this.updateCanvasSize();
    this.ctx = this.canvas.getContext('2d');

    this.balloon = new Balloon(this);
    this.timeline = new Timeline(
      this,
      {
        onRangeChange: () => {
          this.draw();
        }
      }
    );

    this.drawSwitches();
  }

  drawSwitches() {
    const switchesWrapper = this.wrapper.querySelector('.chart__switches');

    Object.keys(this.getGraphs()).forEach((key) => {
      const label = document.createElement('label');

      label.classList.add('check');
      label.innerHTML = `
        <input class="check__input" type="checkbox" value="${key}" checked>
        <span class="check__box" style="border-color: ${this.model[key].lineColor}; background-color: ${this.model[key].lineColor};"></span>
        <span class="check__value">${this.model[key].name}</span>
      `;

      switchesWrapper.appendChild(label);

      label.querySelector('.check__input').addEventListener('change', (event) => {
        this.toggleGraphVisible(event.target.value, event.target.checked);
        this.updateDisabledSwitches();
      });
    });

    this.updateDisabledSwitches();
  }

  updateDisabledSwitches() {
    const checked = this.wrapper.querySelectorAll('.check .check__input:checked');

    if (checked.length === 1) {
      return checked[0].disabled = true;
    }

    [].slice.call(checked).forEach((check) => check.disabled = false);
  }

  updateCanvasSize() {
    this.canvas.width = this.canvas.parentNode.offsetWidth;
    this.canvas.height = Math.max(window.innerHeight * 0.4, 180);
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
    this.drawXValues();
    this.drawYValues();
  }

  getGraphs(isOnlyVisible) {
    return Object.keys(this.model).reduce((graphs, key) => {
      if (isOnlyVisible && !this.model[key].visible) { return graphs; }

      if (key !== 'x') {
        graphs[key] = this.model[key];
      }

      return graphs;
    }, {});
  }

  getDates(range) {
    return range
      ? this.model.x.columns.slice(range.start, range.end)
      : this.model.x.columns;
  }

  drawGraphs() {
    const drawGraph = getGraphDrawer(this);

    const graphs = this.getGraphs(true);

    Object.keys(graphs).forEach((key) => {
      drawGraph({
        graph: graphs[key],
        range: this.timeline.range,
        marginTop: MARGIN_TOP,
        marginBottom: MARGIN_BOTTOM,
        graphsValuesRange: getGraphsValuesRange(graphs, this.timeline.range),
        lineWidth: 3
      });
    });
  }

  drawYLines() {
    const linesCount = this.canvas.height < 300 ? 3 : Y_VALUES;
    let heightByDelimiter = (this.canvas.height - MARGINS) / (linesCount - 1);

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = document.body.classList.contains('_night')
      ? 'rgba(242, 244, 245, 0.1)'
      : 'rgba(242, 244, 245, 0.7)';

    let x = 0, y = 0;

    for (let i = 0; i < linesCount; i++) {
      y = round(this.canvas.height - (heightByDelimiter * i) - MARGIN_BOTTOM);

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawYValues() {
    const linesCount = this.canvas.height < 300 ? 3 : Y_VALUES;
    const valuesRanges = getGraphsValuesRange(this.getGraphs(true), this.timeline.range);

    let x = 5, y, value = valuesRanges.min;

    let heightByDelimiter = (this.canvas.height - MARGINS) / (linesCount - 1);
    let valueByDelimiter = (valuesRanges.max - valuesRanges.min) / (linesCount - 1);

    for (let i = 0; i < linesCount; i++) {
      y = round(this.canvas.height - (heightByDelimiter * i) - MARGIN_BOTTOM);

      drawText(this.ctx, round(value).toLocaleString(), x, y - 5, FONT_SIZE, '#96a2aa');

      value = value >= valuesRanges.max ? valuesRanges.max : value + valueByDelimiter;
    }
  }

  drawXValues() {
    const datesCount = this.canvas.width < 420 ? 3 : X_VALUES;

    const dates = this.getDates(this.timeline.range);

    const stepByDateRange = round(dates.length / datesCount);
    let dateIndex = 0;

    const widthByDate = this.canvas.width / datesCount - 1;

    let x = 15, y = this.canvas.height - 10;

    for (let i = 0; i < datesCount; i++) {
      const dateString = new Date(dates[dateIndex]).toLocaleDateString(navigator.language || navigator.userLanguage, {
        month: 'short',
        day: 'numeric'
      });

      drawText(this.ctx, dateString, x, y, FONT_SIZE, '#96a2aa');

      dateIndex += stepByDateRange;

      x += widthByDate + 15;
    }
  }

  toggleGraphVisible(graphName, isVisible) {
    Object.keys(this.model).forEach((key) => {
      if (key === graphName) {
        this.model[key].visible = isVisible;
      }
    }, {});

    this.draw();
    this.timeline.draw();
  }

  onColorModeChange() {
    this.wrapper.classList.toggle('chart_night');

    this.draw();

    this.balloon.onColorModeChange();
  }
}
