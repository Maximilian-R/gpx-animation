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
  // https://developer.garmin.com/fit/file-types/activity/

  // which should I use to align well with custom transformers?
  // total_timer_time: "active timer, pauses not included"
  // total_elapsed_timef: "total time, pauses included"

  const activity = data.activity;
  const startTime = activity.local_timestamp;
  const records = activity.sessions.flatMap((session) =>
    session.laps.flatMap((lap) => lap.records)
  );
  const points = records
    .map((record) => {
      const date = new Date(startTime);
      date.setSeconds(date.getSeconds() + record.elapsed_time);

      return {
        lat: record.position_lat,
        lng: record.position_long,
        time: date.toISOString(),
      };
    })
    // safe to filter out points without lat lng ?
    .filter((point) => point.lat && point.lng);

  const distance = activity.sessions
    .map((session) => session.total_distance)
    .reduce((sum, value) => sum + value, 0);

  const track = {
    id,
    index,
    trackName: undefined,
    points,
    distance: distance,
    time: startTime,
  };
  return track;
}
