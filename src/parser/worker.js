importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/fast-xml-parser/4.2.7/fxparser.min.js"
);
const parser = new XMLParser({ ignoreAttributes: false });

addEventListener("message", (event) => {
  event.data.forEach((file, index) => {
    const parsed = parser.parse(file.text);
    postMessage({ index: index + 1, file: parsed });
  });
  postMessage(true);
});
