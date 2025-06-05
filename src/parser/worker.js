import { XMLParser } from "https://cdn.jsdelivr.net/npm/fast-xml-parser@5.2.3/+esm";
import * as fitFileParser from "https://cdn.jsdelivr.net/npm/fit-file-parser@1.21.0/+esm";
import geolib from "https://cdn.jsdelivr.net/npm/geolib@3.3.4/+esm";

const fastXmlParser = new XMLParser({ ignoreAttributes: false });
const fitParser = new fitFileParser.default.default({
  force: true,
  speedUnit: "km/h",
  lengthUnit: "km",
  temperatureUnit: "kelvin",
  pressureUnit: "bar",
  elapsedRecordField: true,
  mode: "cascade",
});

addEventListener("message", async (event) => {
  for (const [index, file] of event.data.entries()) {
    if (file.name.includes(".fit")) {
      const fileContent = await file.arrayBuffer();
      fitParser.parse(fileContent, (error, data) => {
        if (error) {
          console.log(error);
        } else {
          console.log(JSON.stringify(data));
          postMessage(fitToObject(file.name, index, data));
        }
      });
    } else if (file.name.includes(".gpx")) {
      const fileContent = await file.text();
      const xmlContent = fastXmlParser.parse(fileContent);
      postMessage(gpxToObject(file.name, index, xmlContent));
    }
  }

  postMessage(true);
});

function gpxToObject(id, index, xml) {
  const trk = xml.gpx.trk;
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

  const track = {
    id,
    index,
    trackName: trk.name,
    points,
    distance,
    time: xml.gpx.metadata.time,
  };
  return track;
}

function fitToObject(id, index, data) {
  const track = {
    id,
    index,
    // trackName: trk.name,
    // points,
    // distance,
    // time: xml.gpx.metadata.time,
  };
  return track;
}
