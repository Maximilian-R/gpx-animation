import { Pane } from "https://unpkg.com/tweakpane@4.0.3/dist/tweakpane.js";

export default class TimelinePane {
  constructor(settings) {
    this.settings = settings;

    this.pane = new Pane({
      container: document.getElementById("timeline-pane"),
    });

    this.controller;
  }

  initialise(animator) {
    this.setup(animator);
  }

  refresh() {
    this.pane.refresh();
  }

  setup(animator) {
    if (this.controller) this.controller.dispose();
    this.controller = this.pane
      .addBinding(this.settings, "timeline", {
        label: undefined,
        min: 0,
        max: animator.maxDuration(),
        step: 100,
      })
      .on("change", (event) => {
        animator.setTime(event.value);
      });
  }
}
