import '../css/main.scss';

import { Chart } from './chart/chart';

(() => {
  let requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;

  window.requestAnimationFrame = requestAnimationFrame;
})();

document.addEventListener('DOMContentLoaded', () => {
  const chartsInstances = [];

  charts.forEach((data, i) => {
    chartsInstances.push(new Chart({ data, appendTo: '.charts__content' }));
  });

  window.toggleMode = () => {
    document.querySelector('.mode-btn').classList.toggle('mode-btn_night');
    document.body.classList.toggle('_night');

    chartsInstances.forEach((chart) => chart.onColorModeChange());
  };

  window.addEventListener('resize', () => chartsInstances.forEach((chart) => chart.onViewportResize()));
});
