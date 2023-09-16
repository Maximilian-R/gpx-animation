export async function parse(files, onProgress) {
  if (window.Worker) {
    const worker = new Worker("./parser/worker.js");
    const promise = new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        if (typeof event.data === "number") {
          onProgress(event.data);
        } else {
          resolve(event.data);
        }
      };
      worker.postMessage(files);
    });
    const jsonFiles = await promise;
    worker.terminate();

    return jsonFiles.map((json, index) => toObject(json, files[index].name));
  } else {
    console.error("Web Worker not supported");
    throw Error();
  }
}

function toObject(file, name) {
  const points = file.gpx.trk.trkseg.trkpt.map((pt) => ({
    lat: Number(pt["@_lat"]),
    lng: Number(pt["@_lon"]),
    time: pt.time,
  }));

  const distance = points.reduce((acc, curr, index) => {
    if (index === 0) return 0;
    return acc + L.CRS.EPSG3857.distance(points[index - 1], curr);
  }, 0);

  const gpxObject = {
    fileName: name,
    trackName: file.gpx.trk.name,
    points,
    distance,
    meta: {
      time: file.gpx.metadata.time,
    },
  };

  return gpxObject;
}
