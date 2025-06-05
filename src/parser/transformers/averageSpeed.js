import geolib from "https://cdn.jsdelivr.net/npm/geolib@3.3.4/+esm";

export default function averageSpeed(list, range = 7) {
  return list.map((trackData) => {
    const points = trackData.points.map((point, index) => {
      const averageSpeed = smoothedSpeed(trackData.points, index, range);

      return {
        ...point,
        speed: averageSpeed,
      };
    });
    return {
      ...trackData,
      points: points,
    };
  });
}

// calculate the average speed over a range of points to reduce noise in gps data.
function smoothedSpeed(points, index, range = 7) {
  let totalDistance = 0;
  let totalTime = 0;

  const halfRange = Math.floor(range / 2);

  for (
    let i = Math.max(0, index - halfRange);
    i < Math.min(points.length - 1, index + halfRange);
    i++
  ) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const distance = geolib.getDistance(
      { longitude: p1.lng, latitude: p1.lat },
      { longitude: p2.lng, latitude: p2.lat }
    ); // m
    const duration = (new Date(p2.time) - new Date(p1.time)) / 1000; // seconds

    if (distance < 1 || duration < 0.25 || distance / duration > 30) {
      // Skip this segment: too short, too fast, or too noisy
      continue;
    }

    totalDistance += distance;
    totalTime += duration;
  }

  if (totalTime === 0) return 0;

  const avgSpeed = (totalDistance / totalTime) * 3.6; // m/s to km/h
  return avgSpeed;
}
