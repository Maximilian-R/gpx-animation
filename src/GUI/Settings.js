import { Pane } from "https://unpkg.com/tweakpane@4.0.3/dist/tweakpane.js";

export default class SettingsPane {
  constructor(settings, map) {
    this.settings = settings;
    this.map = map;

    this.pane = new Pane({
      container: document.getElementById("settings-gui"),
      title: "Settings",
    });
  }

  initialise(animator) {
    this.setupRender(animator);
  }

  refresh() {
    this.pane.refresh();
  }

  setupRender(animator) {
    const folder = this.pane.addFolder({ title: "Rendering" });

    folder
      .addBinding(this.settings.render, "paths", { label: "Paths" })
      .on("change", () => {
        animator.update(true);
      });

    folder
      .addBinding(this.settings, "theme", {
        label: "Theme",
        options: {
          ["Positron"]: 0,
          ["Dark Matter"]: 1,
          ["Dark Matter Brown"]: 2,
          ["OSM Bright"]: 3,
        },
      })
      .on("change", (event) => {
        this.map.setTileLayer(event.value);
      });
  }
}
