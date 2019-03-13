import '../css/main.scss';

import { ModeToggler } from './mode-toggler/mode-toggler';
import { Chart } from './chart/chart';

import charts from '../chart_data.json';

console.log('>>> CHARTS', charts);

document.addEventListener('DOMContentLoaded', () => {
  window.modeToggler = new ModeToggler();

  window.chart = new Chart({
    selector: '#chart',
    data: charts[0]
  });

  const switches = document.querySelector('.chart__switches');

  Object.keys(charts[0].names).forEach((key) => {
    const label = document.createElement('label');

    label.classList.add('check');
    label.innerHTML = `
      <input class="check__input" type="checkbox" value="${key}" checked>
      <span class="check__value" >${charts[0].names[key]}</span>
    `;

    switches.appendChild(label);
  });

  chart.draw();
});
