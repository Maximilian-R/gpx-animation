import { Semver } from "https://unpkg.com/tweakpane@4.0.3/dist/tweakpane.js";
import { LeaderboardController } from "./controller.js";

export const LeaderboardPlugin = {
  core: new Semver("2.0.1"),
  id: "leaderboard",
  type: "input",

  accept(value, params) {
    if (params.view !== "leaderboard") {
      return null;
    }
    // Return a typed value and params to accept the user input
    return {
      initialValue: value,
      params: params,
    };
  },

  binding: {
    reader: () => (value) => value,
    writer: () => (target, value) => target.write(value),
  },

  controller(args) {
    return new LeaderboardController(args.document, {
      value: args.value,
      viewProps: args.viewProps,
    });
  },
};
