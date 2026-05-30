import SETTINGS from "../app/Settings.js";
import TimelinePane from "./Timeline.js";
import LeaderboardPane from "./Leaderboard.js";
import SettingsPane from "./Settings.js";
import ActivitesPane from "./Activities.js";

export default class PaneManager {
  constructor(map) {
    this.map = map;
    this.settings = SETTINGS;

    this.settingsPane = new SettingsPane(this.settings, this.map);
    this.activitesPane = new ActivitesPane(this.settings);
    this.leaderboardPane = new LeaderboardPane(this.settings);
    this.timelinePane = new TimelinePane(this.settings);

    this.panes = [
      this.settingsPane,
      this.activitesPane,
      this.leaderboardPane,
      this.timelinePane,
    ];
  }

  refresh() {
    this.panes.forEach((pane) => pane.refresh());
  }

  initialise(animator) {
    this.panes.forEach((pane) => pane.initialise(animator));
  }

  disable() {
    this.panes.forEach((pane) => (pane.pane.disabled = true));
    this.refresh();
  }

  enable() {
    this.panes.forEach((pane) => (pane.pane.disabled = false));
  }
}
