import SETTINGS from "../../gui/Settings.js";
import { distance, duration, toSeconds } from "./utils.js";

export default function trimStartEnd(map, list) {
  return list.map((gpx) => {
    return {
      ...gpx,
      points: removePoints(
        map,
        gpx.points,
        SETTINGS.transform.trimStart,
        SETTINGS.transform.trimEnd
      ),
    };
  });
}

function removePoints(map, points, startRadius = 0, endRadius = 0) {
  //must have a reference location and visual like filter radius...
  // if(startRadius > 0) {
  //     for (let index = 0; index < points.length; index++) {
  //         const point = points[index];
  //         if(distance(map, ))
  //     }
  // }
}
