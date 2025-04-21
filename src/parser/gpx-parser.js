export async function parse(files, onProgress, onFail) {
  if (window.Worker) {
    const worker = new Worker("./parser/worker.js");
    const parsedFiles = [];
    const promise = new Promise((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        if (typeof data === "boolean") {
          resolve(files);
        } else {
          try {
            parsedFiles.push(toObject(data));
          } catch (error) {
            console.log(error);
            onFail(data.index);
          }
          onProgress(data.index);
        }
      };
      worker.postMessage(files);
    });
    await promise;
    worker.terminate();

    return parsedFiles;
  } else {
    console.error("Web Worker not supported");
    throw Error();
  }
}

function toObject({ file, name, index }) {
  const trk = file.gpx.trk;
  const points =
    trk.trkseg.trkpt.map((pt) => ({
      lat: Number(pt["@_lat"]),
      lng: Number(pt["@_lon"]),
      time: pt.time,
    })) ?? [];

  const distance = points.reduce((acc, curr, index) => {
    if (index === 0) return 0;
    return acc + L.CRS.EPSG3857.distance(points[index - 1], curr);
  }, 0);

  points.forEach((point, index) => {
    point.speed = smoothedSpeed(points, index);
  });

  const gpxObject = {
    index,
    id: name,
    trackName: trk.name,
    points,
    distance,
    meta: {
      time: file.gpx.metadata.time,
    },
  };
  return gpxObject;
}

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

    const distance = L.CRS.EPSG3857.distance(p1, p2); // m
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
