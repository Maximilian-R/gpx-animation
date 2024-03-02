import { LeaderboardView } from "./view.js";

export class LeaderboardController {
  constructor(host, config) {
    this.value = config.value;
    this.viewProps = config.viewProps;

    this.view = new LeaderboardView(host, {
      value: config.value,
      viewProps: this.viewProps,
    });
  }
}
