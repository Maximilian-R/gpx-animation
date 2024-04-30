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
            parsedFiles.push(toObject(data.file, files[data.index]));
          } catch {
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

function toObject(file, name) {
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

  const gpxObject = {
    fileName: name,
    trackName: trk.name,
    points,
    distance,
    meta: {
      time: file.gpx.metadata.time,
    },
  };
  return gpxObject;
}
