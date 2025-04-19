import { Pane } from "https://unpkg.com/tweakpane@4.0.3/dist/tweakpane.js";
import { FileUploadPluginBundle } from "../tweakpane-plugin/file-upload/index.js";

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
    this.setuUpload(animator);
    this.setupTransforms(animator);
    this.setupFilter(animator);
    this.setupRender(animator);
  }

  refresh() {
    this.pane.refresh();
  }

  setupTransforms(animator) {
    const folder = this.pane.addFolder({
      title: "Transformers",
    });

    folder
      .addBinding(this.settings.transform, "removePauses", {
        label: `Remove Pauses`,
      })
      .on("change", (event) => {
        animator.applyTransformers();
      });

    folder
      .addBinding(this.settings.transform, "removeWaiting", {
        label: `Remove Waiting`,
      })
      .on("change", (event) => {
        animator.applyTransformers();
      });

    folder
      .addBinding(this.settings.transform, "trimStart", {
        label: `Trim Start Radius`,
      })
      .on("change", (event) => {
        if (event.last) {
          animator.applyTransformers();
        }
      });

    folder
      .addBinding(this.settings.transform, "trimEnd", {
        label: `Trim End Radius`,
      })
      .on("change", (event) => {
        if (event.last) {
          animator.applyTransformers();
        }
      });
  }

  setupFilter(animator) {
    const filtersFolder = this.pane.addFolder({
      title: "Filters",
    });

    const createLocationFilter = (property, name) => {
      const folder = filtersFolder.addFolder({
        title: `${name} location`,
        expanded: false,
      });
      const onController = folder.addBinding(
        this.settings.filter[property],
        "on",
        {
          label: `Enable`,
        }
      );
      const radiusController = folder.addBinding(
        this.settings.filter[property],
        "radius",
        {
          label: `Radius`,
          min: 50,
          max: 5000,
          step: 50,
          disabled: true,
          hidden: false,
        }
      );
      const latlngController = folder.addBinding(
        this.settings.filter[property],
        "latlng",
        {
          label: `Coordinates`,
          y: { min: -90, max: 90 },
          x: { min: -180, max: 180 },
          disabled: true,
          hidden: false,
        }
      );
      const resetButton = folder.addButton({
        title: "Move to view",
        label: "",
        disabled: true,
      });

      const filter = animator[property + "Filter"];
      onController.on("change", (event) => {
        radiusController.disabled = !event.value;
        latlngController.disabled = !event.value;
        resetButton.disabled = !event.value;
        filter.setOn(event.value);
      });
      radiusController.on("change", (event) => {
        filter.resize(event.value);
        if (event.last) {
          filter.setRadius(event.value);
        }
      });
      latlngController.on("change", ({ value, last }) => {
        if (last) {
          filter.setPosition({
            lat: value.x,
            lng: value.y,
          });
        }
      });
      resetButton.on("click", () => {
        filter.reset();
      });
    };

    const createDateFilter = (property, name) => {
      const folder = filtersFolder.addFolder({
        title: `${name} range`,
        expanded: false,
      });
      const onController = folder.addBinding(
        this.settings.filter[property],
        "on",
        {
          label: `Enable`,
        }
      );
      const fromController = folder.addBinding(
        this.settings.filter[property],
        "from",
        {
          label: `From`,
          disabled: true,
        }
      );
      const toController = folder.addBinding(
        this.settings.filter[property],
        "to",
        {
          label: `to`,
          disabled: true,
        }
      );

      const filter = animator[property + "Filter"];
      onController.on("change", (event) => {
        fromController.disabled = !event.value;
        toController.disabled = !event.value;
        filter.setOn(event.value);
      });
      fromController.on("change", ({ value }) => {
        filter.setFrom(value);
      });
      toController.on("change", ({ value }) => {
        filter.setTo(value);
      });
    };

    createLocationFilter("start", "Start");
    createLocationFilter("through", "Through");
    createLocationFilter("end", "End");
    createDateFilter("date", "Date");
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

  setuUpload(animator) {
    this.pane.registerPlugin(FileUploadPluginBundle);
    const folder = this.pane.addFolder({ title: "Files" });
    const filesController = folder.addBinding(this.settings, "files", {
      view: "file-upload",
      label: undefined,
    });

    filesController.on("change", (event) => {
      animator.add(event.value.add);
    });
  }
}
