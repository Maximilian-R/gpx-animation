import { Pane } from "https://unpkg.com/tweakpane@4.0.5/dist/tweakpane.js";
import * as TweakpaneEssentialsPlugin from "https://unpkg.com/@tweakpane/plugin-essentials@0.2.1/dist/tweakpane-plugin-essentials.min.js";
import { LeaderboardPluginBundle } from "../tweakpane-plugin/leaderboard/index.js";

export default class LeaderboardPane {
  constructor(settings) {
    this.settings = settings;

    this.pane = new Pane({
      container: document.getElementById("leaderboard-pane"),
      title: "Main",
    });
    this.pane.registerPlugin(TweakpaneEssentialsPlugin);
  }

  initialise(animator) {
    this.setupAnimation(animator);
    this.setupLeaderboard(animator);
  }

  refresh() {
    this.pane.refresh();
  }

  setupLeaderboard(animator) {
    const folder = this.pane.addFolder({ title: "Leaderboard" });
    folder.addBinding(animator, "time", {
      label: "Time",
      readonly: true,
      format: (duration) => {
        const date = new Date(duration);
        return `${date.getUTCHours()}h ${date.getMinutes()}min ${date.getSeconds()}s`;
      },
    });

    this.pane.registerPlugin(LeaderboardPluginBundle);
    const leaderboardController = folder.addBinding(
      this.settings,
      "leaderboard",
      {
        view: "leaderboard",
        label: undefined,
        readonly: true,
      }
    );

    leaderboardController.controller.viewProps.emitter.on("click", (event) => {
      this.settings.camera.target = event.target;
      this.settings.camera.mode = 1;
      this.refresh();
      animator.updateCamera();
    });
  }

  setupAnimation(animator) {
    const folder = this.pane.addFolder({ title: "Animation" });

    const cameraController = folder.addBinding(this.settings.camera, "mode", {
      label: "Camera",
      options: {
        ["Fit all"]: 0,
        ["Follow Target"]: 1,
        ["Free"]: 2,
      },
    });

    const cameraTargetController = folder.addBinding(
      this.settings.camera,
      "target",
      {
        label: "Camera Target",
        step: 1,
        min: 0,
        hidden: true,
      }
    );

    cameraController.on("change", (event) => {
      cameraTargetController.hidden = event.value !== 1;
    });

    const factor = [1, 5, 25, 50, 100, 1000];
    folder.addBinding(this.settings, "speed", {
      view: "radiogrid",
      groupName: "speed",
      size: [3, 2],
      cells: (x, y) => {
        return {
          title: `${factor[x + y * 3]}x`,
          value: factor[x + y * 3],
        };
      },

      label: "Time factor",
    });

    const playButton = folder.addButton({
      title: "Play",
    });
    playButton.on("click", () => {
      animator.isPlaying ? animator.stop() : animator.play();
    });
    animator.addEventListener(() => {
      playButton.title = animator.isPlaying ? "Pause" : "Play";
    });
  }
}
