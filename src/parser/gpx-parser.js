import geolib from "https://cdn.jsdelivr.net/npm/geolib@3.3.4/+esm";

export async function parse(files, onProgress, onFail) {
  if (window.Worker) {
    const worker = new Worker("./parser/worker.js", {
      type: "module",
    });
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

  const distance = points.reduce((acc, current, index) => {
    if (index === 0) return 0;
    const previous = points[index - 1];

    return (
      acc +
      geolib.getDistance(
        { longitude: previous.lng, latitude: previous.lat },
        { longitude: current.lng, latitude: current.lat }
      )
    );
  }, 0);

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
