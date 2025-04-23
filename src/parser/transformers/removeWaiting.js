import geolib from "https://cdn.jsdelivr.net/npm/geolib@3.3.4/+esm";

// what is a wait?
// if a serie of points (with at least 10 seconds of span) havent moved more than 1m, remove all points until the 1m distance is broken

import { distance, duration, toSeconds } from "./utils.js";

export default function removeWaiting(list) {
  return list.map((gpx) => {
    return {
      ...gpx,
      points: removePoints(gpx.points),
    };
  });
}

//what are good seconds/meter values? Or should it only check after longs gaps in the gps time? (eg the tracking was paused)
function removePoints(points, seconds = 10, meters = 5) {
  // console.groupCollapsed("remove waiting");
  // console.log("array size before", points.length);
  if (points.length < 2) {
    return points;
  }

  let result = [points[0]];
  let stash = [];
  let totalTimeOffset = 0;

  for (let index = 1; index < points.length; index++) {
    const previous = result.at(-1);
    const current = points[index];
    current.time = current.time - totalTimeOffset;

    const distanceDiff = geolib.getDistance(previous, current);

    if (distanceDiff > meters) {
      if (stash.length > 0) {
        const durationDiff = duration(previous, current);
        if (toSeconds(durationDiff) < seconds) {
          result.push(...stash);
          stash = [];
        } else {
          // console.groupCollapsed(
          //   "delete",
          //   toSeconds(durationDiff),
          //   "seconds at index",
          //   index
          // );
          // console.log("stash", stash);
          // console.groupEnd();
          stash = [];
          totalTimeOffset += durationDiff;
          current.time = current.time - durationDiff;
        }
      }
      result.push(current);
    } else {
      stash.push(current);
    }
  }

  if (stash.length > 0) {
    const previous = result.at(-1);
    const current = stash.at(-1);
    const durationDiff = duration(previous, current);
    if (toSeconds(durationDiff) < seconds) {
      result.push(...stash);
    }
  }

  // console.log("array size after", result.length);
  // console.log("total offset time", toSeconds(totalTimeOffset));
  // console.groupEnd();
  return result;
}
