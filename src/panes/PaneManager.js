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
  }

  refresh() {
    this.settingsPane.refresh();
    this.activitesPane.refresh();
    this.leaderboardPane.refresh();
    this.timelinePane.refresh();
  }

  initialise(animator) {
    this.settingsPane.initialise(animator);
    this.activitesPane.initialise(animator);
    this.leaderboardPane.initialise(animator);
    this.timelinePane.initialise(animator);
  }
}
