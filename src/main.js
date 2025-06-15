import Map from "./app/Map.js";
import Animator from "./app/Animator.js";
import PaneManager from "./panes/PaneManager.js";

async function main() {
  const map = new Map();
  const paneManager = new PaneManager(map);
  const animator = new Animator(paneManager, map.map, []);
}

main();
