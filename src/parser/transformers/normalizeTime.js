export default function normalizeTime(list, base = new Date("2000-01-01")) {
  return list.map((trackData) => {
    const start = new Date(trackData.points[0].time);
    const points = trackData.points.map((point) => {
      const time = new Date(point.time);
      const elapsedTime = time - start;
      return {
        ...point,
        time: elapsedTime,
      };
    });
    return {
      ...trackData,
      points: points,
    };
  });
}
