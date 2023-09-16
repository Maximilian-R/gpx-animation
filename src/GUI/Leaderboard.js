import { Pane } from "https://unpkg.com/tweakpane@4.0.3/dist/tweakpane.js";
import { LeaderboardPluginBundle } from "../../tweakpane-plugin/leaderboard/index.js";

export default class LeaderboardPane {
  constructor(settings) {
    this.settings = settings;

    this.pane = new Pane({
      container: document.getElementById("leaderboard-gui"),
      title: "Main",
    });
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
    folder.addBinding(this.settings, "leaderboard", {
      view: "leaderboard",
      label: undefined,
      readonly: true,
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

    folder.addBinding(this.settings, "speed", {
      label: "Speed X",
      min: 1,
      max: 1000,
      step: 1,
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
