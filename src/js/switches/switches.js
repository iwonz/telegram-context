export class Switches {
  constructor(chart) {
    this.chart = chart;

    this.draw();
  }

  draw() {
    const switches = document.querySelector('.chart__switches');

    Object.keys(this.chart.getGraphs()).forEach((key) => {
      const label = document.createElement('label');

      label.classList.add('check');
      label.innerHTML = `
          <input class="check__input" type="checkbox" value="${key}" onChange="switches.onSwitchChange(event);" checked>
          <span class="check__box" style="border-color: ${this.chart.model[key].lineColor}; background-color: ${this.chart.model[key].lineColor};"></span>
          <span class="check__value">${this.chart.model[key].name}</span>
        `;

      switches.appendChild(label);
    });

    this.updateDisabled();
  }

  updateDisabled() {
    const checked = document.querySelectorAll('.check .check__input:checked');

    if (checked.length === 1) {
      checked[0].disabled = true;
    } else {
      [...checked].forEach((check) => check.disabled = false);
    }
  }

  onSwitchChange(event) {
    this.chart.toggleGraphVisible(event.target.value, event.target.checked);

    this.updateDisabled();
  }
}
