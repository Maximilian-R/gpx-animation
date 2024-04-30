import { parse } from "../../parser/gpx-parser.js";
import { readFiles } from "./file-reader.js";

export class FileUploadView {
  constructor(host, config) {
    this.config = config;

    this.element = host.createElement("div");
    this.element.classList.add("tp-file-upload");

    this.dropzone = host.createElement("div");
    this.dropzone.classList.add("tp-file-drop-zone");
    this.dropzone.textContent = "Drop .gpx files here";
    this.element.appendChild(this.dropzone);

    this.dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    this.dropzone.addEventListener("dragenter", (e) => {
      this.dropzone.classList.add("drag-enter");
    });

    this.dropzone.addEventListener("dragleave", (e) => {
      this.dropzone.classList.remove("drag-enter");
    });

    this.dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      this.dropzone.classList.remove("drag-enter");

      const message = this.status.children[0];
      const totalFiles = e.dataTransfer.items.length;
      message.textContent = `Reading file 0 of ${totalFiles}`;
      this.progress.toggleAttribute("loading", true);
      let errors = 0;
      const files = await readFiles([...e.dataTransfer.items]);
      const items = await parse(
        files,
        (index) => {
          message.textContent = `Reading file ${index} of ${totalFiles}`;
          this.progress.setAttribute("value", (index / totalFiles) * 100);
        },
        (index) => {
          errors++;
        }
      );
      config.value.rawValue = {
        add: items,
      };

      message.textContent = `Parsed ${items.length} files`;
      if (errors > 0) {
        message.textContent += ` - Failed to parse ${errors} files`;
      }
    });

    this.status = host.createElement("div");
    this.status.classList.add("tp-file-status");
    this.message = host.createElement("span");
    this.progress = host.createElement("progress");
    this.progress.setAttribute("max", 100);

    this.status.appendChild(this.message);
    this.status.appendChild(this.progress);
    this.element.appendChild(this.status);

    // listen and update UI? THen no need to call refresh ui
    // value.emitter.on("change", () => this.update(value.rawValue));
  }
}
