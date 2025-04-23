import normalizeTime from "./normalizeTime.js";
import removePauses from "./removePauses.js";
import removeWaiting from "./removeWaiting.js";
import averageSpeed from "./averageSpeed.js";
// import trimStartEnd from "./trimStartEnd.js";

addEventListener("message", (event) => {
  const { settings, files: originalFiles } = event.data;

  let files = originalFiles;
  if (settings.averageSpeed) files = averageSpeed(files);
  if (settings.normalize) files = normalizeTime(files);
  if (settings.removePauses) files = removePauses(files);
  if (settings.removeWaiting) files = removeWaiting(files);

  postMessage({ files });
});
