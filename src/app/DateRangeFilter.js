import SETTINGS from "./Settings.js";

export default class DateRangeFilter {
  constructor(animator, property) {
    this.animator = animator;
    this.settings = SETTINGS.filter[property];

    this.settings.from = "2000-01-01";
    this.settings.to = new Date().toISOString().slice(0, 10);
  }

  get on() {
    return this.settings.on;
  }

  setOn() {
    this.animator.applyFilter();
  }

  setFrom(date) {
    this.settings.from = date;
    this.animator.applyFilter();
  }
  setTo(date) {
    this.settings.to = date;
    this.animator.applyFilter();
  }

  match(track) {
    if (!this.on) return true;
    const date = Date.parse(track.date);
    return (
      date >= Date.parse(this.settings.from) &&
      date <= Date.parse(this.settings.to)
    );
  }
}
