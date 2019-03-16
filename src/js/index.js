import '../css/main.scss';

import { ModeToggler } from './mode-toggler/mode-toggler';
import { Chart } from './chart/chart';

document.addEventListener('DOMContentLoaded', () => {
  window.modeToggler = new ModeToggler();

  fetch('./assets/chart_data.json')
    .then((response) => response.json())
    .then((charts) => {
      console.log('>>> CHARTS', charts);

      window.chart = new Chart({
        selector: '#chart',
        timeline: {
          enabled: true,
          selector: '#timeline'
        },
        data: charts[0]
      });

      const switches = document.querySelector('.chart__switches');

      Object.keys(chart.getGraphs()).forEach((key) => {
        const label = document.createElement('label');

        label.classList.add('check');
        label.innerHTML = `
          <input class="check__input" type="checkbox" value="${key}" checked>
          <span class="check__value" >${charts[0].names[key]}</span>
        `;

        switches.appendChild(label);
      });
    });
});
