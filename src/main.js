import Map from "./app/Map.js";
import Animator from "./app/Animator.js";
import GUI from "./GUI/GUI.js";

async function main() {
  const map = new Map();
  const gui = new GUI(map);
  const animator = new Animator(gui, map.map, []);
}

main();
