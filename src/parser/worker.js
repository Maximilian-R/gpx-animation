importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/fast-xml-parser/4.2.7/fxparser.min.js"
);
const parser = new XMLParser({ ignoreAttributes: false });

addEventListener("message", (event) => {
  const files = event.data.map((file, index) => {
    const parsed = parser.parse(file.text);
    postMessage(index + 1);
    return parsed;
  });
  postMessage(files);
});
