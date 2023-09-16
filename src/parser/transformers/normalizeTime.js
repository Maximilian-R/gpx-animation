export default function normalizeTime(list, base = new Date("2000-01-01")) {
  return list.map((gpx) => {
    const start = new Date(gpx.points[0].time);
    const points = gpx.points.map((point) => {
      const time = new Date(point.time);
      const elapsedTime = time - start;
      return {
        ...point,
        time: elapsedTime,
      };
    });
    return {
      ...gpx,
      points: points,
    };
  });
}
