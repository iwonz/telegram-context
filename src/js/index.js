import '../css/main.scss';

import charts from '../chart_data.json';

console.log(charts);

const canvas = document.getElementById('chart');
canvas.width = window.innerWidth;
canvas.height = 500;
const chart = canvas.getContext('2d');
