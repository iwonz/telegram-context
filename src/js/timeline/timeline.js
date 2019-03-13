import { defaultsDeep, get } from 'lodash';

export class Timeline {
  constructor(config) {
    this.config = defaultsDeep(config, {
      selector: '#timeline'
    });

    this.canvas = document.querySelector(config.selector);
    this.canvas.width = this.canvas.parentNode.clientWidth;
    this.canvas.height = 80;
    this.timeline = this.canvas.getContext('2d');
  }

  init() {
    console.log('>>> MODEL', this.config.data);

    this.drawGraphs();
  }

  drawGraphs() {
    const columnsCount = get(this.config.data, '[0].columns.length');
    const columnWidth = this.canvas.width / columnsCount;

    let maxYValue = 0;

    this.config.data.forEach((graph) => {
      const max = Math.max(...graph.columns);

      if (max > maxYValue) {
        maxYValue = max;
      }
    });

    const coef =  this.canvas.height / maxYValue;

    for (let j = 0; j < this.config.data.length; j++) {
      let x = 0;

      for (let i = 0; i < this.config.data[j].columns.length - 1; i++) {
        this.timeline.beginPath();
          this.timeline.moveTo(x, this.canvas.height - this.config.data[j].columns[i] * coef);
          this.timeline.lineTo(x + columnWidth, this.canvas.height - this.config.data[j].columns[i + 1] * coef);
          this.timeline.strokeStyle = this.config.data[j].lineColor;
        this.timeline.stroke();

        x += columnWidth;
      }
    }
  }
}
