import '../css/main.scss';

import { ModeToggler } from './mode-toggler/mode-toggler';
import { Chart } from './chart/chart';
import { Switches } from './switches/switches';

document.addEventListener('DOMContentLoaded', () => {
  window.modeToggler = new ModeToggler();

  fetch('./assets/chart_data.json')
    .then((response) => response.json())
    .then((charts) => {
      console.log('>>> CHARTS', charts);

      const data = charts[0];

      window.chart = new Chart({
        selector: '#chart',
        timeline: {
          enabled: true,
          selector: '#timeline'
        },
        data
      });

      window.switches = new Switches(chart);

      window.addEventListener('resize', () => {
        chart.onViewportResize();
      });
    });
});
