import { duration, toSeconds } from "./utils.js";

// remove pauses in the gps-data - eg the tracking was paused and has a long gap in time between two points
// False positives: could long gaps be caused by other things as well - no gps signal in tunnels?
export default function removePauses(list) {
  return list.map((trackData) => {
    return {
      ...trackData,
      points: offsetTime(trackData.points),
    };
  });
}

function offsetTime(points, seconds = 30) {
  // console.groupCollapsed("remove pauses");

  let totalTimeOffset = 0;
  points.forEach((current, index) => {
    current.time -= totalTimeOffset;

    const previous = points[index - 1];
    if (previous) {
      const durationDiff = duration(previous, current);
      if (toSeconds(durationDiff) > seconds) {
        // console.log(
        //   "pause at index",
        //   index,
        //   "paused for",
        //   toSeconds(durationDiff),
        //   "seconds"
        // );
        current.time -= durationDiff;
        totalTimeOffset += durationDiff;
      }
    }
  });

  // console.log("total time removed", toSeconds(totalTimeOffset), "seconds");
  // console.groupEnd();
  return points;
}
