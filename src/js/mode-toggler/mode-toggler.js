const MODE = [
  {
    label: 'Light Mode',
    className: 'chart_light'
  },
  {
    label: 'Night Mode',
    className: 'chart_night'
  }
];

export class ModeToggler {
  constructor(mode = 0) {
    this.mode = mode;

    this.wrapper = document.querySelector('.chart');
    this.toggleModeButton = document.querySelector('.change-mode-button');

    this.update();
  }

  toggle() {
    this.mode = +!this.mode;

    this.update();
  }

  update() {
    this.wrapper.classList.remove(MODE[0].className);
    this.wrapper.classList.remove(MODE[1].className);

    this.wrapper.classList.add(MODE[this.mode].className);
    this.toggleModeButton.innerText = `Switch to ${MODE[+!this.mode].label}`;
  }
}
