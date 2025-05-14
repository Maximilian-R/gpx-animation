import { XMLParser } from "https://cdn.jsdelivr.net/npm/fast-xml-parser@5.2.3/+esm";

const parser = new XMLParser({ ignoreAttributes: false });

addEventListener("message", (event) => {
  event.data.forEach((file, index) => {
    const parsed = parser.parse(file.text);
    postMessage({ index: index, name: file.name, file: parsed });
  });
  postMessage(true);
});
