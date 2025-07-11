import SETTINGS from "../../paneManager/Settings.js";
import { distance, duration, toSeconds } from "./utils.js";

export default function trimStartEnd(map, list) {
  return list.map((trackData) => {
    return {
      ...trackData,
      points: removePoints(
        map,
        trackData.points,
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
