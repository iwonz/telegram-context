import { defaultsDeep } from 'lodash';

export class Chart {
  constructor(config) {
    this.config = defaultsDeep({
      marginTop: 20,
      marginBottom: 40,
      fontSize: 16,
      sections: {
        x: 6,
        y: 6
      }
    }, config);

    this.data = config.data;
    this.model = {};

    this.canvas = document.querySelector(config.selector);
    this.canvas.width = this.canvas.parentNode.clientWidth;
    this.canvas.height = 500;
    this.chart = this.canvas.getContext('2d');
  }

  draw() {
    console.log('>>> DATA', this.data);

    this.data.columns.forEach((column) => {
      this.model[column[0]] = {
        columns: column.slice(1),
        type: this.data.types[column[0]],
        name: this.data.names[column[0]],
        lineColor: this.data.colors[column[0]]
      };
    });

    console.log('>>> MODEL', this.model);

    this.drawY();
  }

  drawY() {
    let maxYValue = 0;

    Object.keys(this.model).forEach((key) => {
      if (key === 'x') { return; }

      const max = Math.max(...this.model[key].columns);

      if (max > maxYValue) {
        maxYValue = max;
      }
    });

    let value = maxYValue;
    let heightByDelimiter = (this.canvas.height - this.config.marginBottom - this.config.marginTop) / (this.config.sections.y - 1);
    let valueByDelimiter = maxYValue / this.config.sections.y;

    for (let i = 0; i < this.config.sections.y; i++) {
      let x = 0,
          y = heightByDelimiter * i + this.config.marginTop;

      this._drawText(value, x, y - 5, this.config.fontSize);
      this._drawLine(x, y, this.canvas.width, y, '#f2f4f5');

      value = Math.floor(value - valueByDelimiter);

      if (value <= valueByDelimiter) { value = 0; }
    }
  }

  _drawLine(fromX, fromY, toX, toY, color = 'red') {
    this.chart.beginPath();
    this.chart.moveTo(fromX, fromY);
    this.chart.lineTo(toX, toY);
    this.chart.strokeStyle = color;
    this.chart.stroke();
  }

  _drawText(text, x, y, fontSize, font = 'Arial, Tahoma') {
    this.chart.font = `${fontSize}px ${font}`;
    this.chart.fillStyle = '#96a2aa';

    this.chart.fillText(text, x, y);
  }
}
