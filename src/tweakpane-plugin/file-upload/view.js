import { parse } from "../../parser/gpx-parser.js";
import { readFiles } from "./file-reader.js";

export class FileUploadView {
  constructor(host, config) {
    this.config = config;
    this.files = [];

    this.element = host.createElement("div");
    this.element.classList.add("tp-file-upload");

    // listen and update UI? THen no need to call refresh ui
    // value.emitter.on("change", () => this.update(value.rawValue));

    this.createDropZone(this.element);
    this.createFileList(this.element);
  }

  addFiles(files) {
    this.config.value.rawValue = {
      add: files,
    };
    this.files = [...this.files, ...files];
  }

  removeFile(removeFile) {
    this.config.value.rawValue = {
      remove: removeFile,
    };

    this.files = this.files.filter((file) => file !== removeFile);
  }

  setStatus(message, progress) {
    this.progressElement.toggleAttribute("loading", true);
    this.messageElement.textContent = message;
    this.progressElement.setAttribute("value", progress);
  }

  async processSelectedFiles(e) {
    const totalFiles = e.dataTransfer.items.length;

    this.setStatus(`Reading file 0 of ${totalFiles}`, 0);

    let errors = 0;
    const files = await readFiles([...e.dataTransfer.items]);
    const parsedFiles = await parse(
      files,
      (index) => {
        this.setStatus(
          `Reading file ${index + 1} of ${totalFiles}`,
          (index + 1 / totalFiles) * 100
        );
      },
      (index) => {
        console.log("Failed to parse", files[index]);
        errors++;
      }
    );

    this.addFiles(parsedFiles);

    let message = `Parsed ${parsedFiles.length} files`;
    if (errors > 0) {
      this.messageElement.textContent += ` - Failed to parse ${errors} files`;
    }
    this.setStatus(message, 100);
  }

  createDropZone(host) {
    const dropzoneElement = document.createElement("div");
    dropzoneElement.classList.add("tp-file-drop-zone");
    dropzoneElement.textContent = "Drop .gpx files here";
    host.appendChild(dropzoneElement);

    dropzoneElement.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    dropzoneElement.addEventListener("dragenter", (e) => {
      dropzoneElement.classList.add("drag-enter");
    });

    dropzoneElement.addEventListener("dragleave", (e) => {
      dropzoneElement.classList.remove("drag-enter");
    });

    dropzoneElement.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropzoneElement.classList.remove("drag-enter");
      await this.processSelectedFiles(e);
      this.createFileList(this.element);
    });

    const statusElement = document.createElement("div");
    statusElement.classList.add("tp-file-status");
    host.appendChild(statusElement);

    const messageElement = document.createElement("span");
    statusElement.appendChild(messageElement);

    const progressElement = document.createElement("progress");
    progressElement.setAttribute("max", 100);
    statusElement.appendChild(progressElement);

    this.messageElement = messageElement;
    this.progressElement = progressElement;
  }

  createFileList(host) {
    const currentFileList = host.querySelector(".tp-leaderboard");
    currentFileList?.remove();

    const filesElement = document.createElement("div");
    filesElement.classList.add("tp-leaderboard");
    host.appendChild(filesElement);

    const listElement = document.createElement("ul");
    filesElement.appendChild(listElement);

    const listItems = this.files.map((file) => {
      const li = document.createElement("li");
      const div1 = document.createElement("div");
      const div2 = document.createElement("div");
      const div3 = document.createElement("div");

      const button = document.createElement("button");
      button.textContent = "x";
      button.addEventListener(
        "click",
        () => {
          this.removeFile(file);
          this.createFileList(host);
        },
        { once: true }
      );

      div1.textContent = file.index;
      div1.setAttribute("title", div1.textContent);

      div2.textContent = file.trackName ?? file.id;
      div2.setAttribute("title", div2.textContent);

      div3.textContent = formatDate(new Date(file.meta.time));
      div3.setAttribute("title", div3.textContent);

      li.appendChild(div1);
      li.appendChild(div2);
      li.appendChild(div3);
      li.appendChild(button);
      return li;
    });
    listElement.replaceChildren(...listItems);
  }
}

function formatDate(date) {
  const formattedDate =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    " " +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0");

  return formattedDate;
}
