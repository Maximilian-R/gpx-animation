import { parse } from "../../parser/file-parser.js";
import { readFiles } from "./file-reader.js";

export class FileUploadView {
  constructor(host, config) {
    this.config = config;
    this.files = [];
    this.errors = [];

    this.element = host.createElement("div");
    this.element.classList.add("tp-file-upload");

    // listen and update UI? THen no need to call refresh ui
    // value.emitter.on("change", () => this.update(value.rawValue));

    this.createDropZone(this.element);
    this.createStatus(this.element);
    this.createActivityList(this.element);
  }

  addFiles(files) {
    this.config.value.rawValue = {
      add: files,
    };
    this.files = [...this.files, ...files];
  }

  removeError(removeError) {
    this.errors = this.errors.filter((e) => e !== removeError);

    this.removeErrorListItem(removeError);
  }

  removeFile(removeFile) {
    this.config.value.rawValue = {
      remove: removeFile,
    };

    this.files = this.files.filter((file) => file !== removeFile);

    this.removeActivityListItem(removeFile);
  }

  setStatus(message, progress) {
    this.progressElement.toggleAttribute("loading", true);
    this.messageElement.textContent = message;
    this.progressElement.setAttribute("value", progress);
  }

  async processSelectedFiles(e) {
    this.config.value.rawValue = {
      isLoading: true,
    };

    const totalFiles = e.dataTransfer.items.length;

    this.setStatus(`Reading file 0 of ${totalFiles}`, 0);

    let parsed = 0;
    const files = await readFiles([...e.dataTransfer.items]);
    const parsedFiles = await parse(
      files,
      (file) => {
        parsed++;
        this.setStatus(
          `Reading file ${parsed + 1} of ${totalFiles}`,
          (parsed / totalFiles) * 100
        );
        this.addActivityListItem(file);
      },
      (index, error) => {
        console.log("Failed to parse", files[index]);
        const errorFile = {
          id: files[index].name,
          index,
          error,
        };
        this.errors.push(errorFile);
        this.addErrorListItem(errorFile);
      }
    );

    this.config.value.rawValue = {
      isLoading: false,
    };

    this.addFiles(parsedFiles);

    let message = `Parsed ${parsedFiles.length} files`;
    if (this.errors.length > 0) {
      message += ` - Failed to parse ${this.errors.length} files`;
    }
    this.setStatus(message, 100);
  }

  createDropZone(host) {
    const dropzoneElement = document.createElement("div");
    dropzoneElement.classList.add("tp-file-drop-zone");
    dropzoneElement.textContent = "Drop [.gpx or .fit] files here";
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
    });
  }

  createStatus(host) {
    const currentStatus = host.querySelector(".tp-file-status");
    currentStatus?.remove();

    const statusElement = document.createElement("div");
    statusElement.classList.add("tp-file-status");
    host.appendChild(statusElement);

    const messageElement = document.createElement("span");
    statusElement.appendChild(messageElement);

    const progressElement = document.createElement("progress");
    progressElement.setAttribute("max", 100);
    statusElement.appendChild(progressElement);

    this.statusElement = statusElement;
    this.messageElement = messageElement;
    this.progressElement = progressElement;
  }

  createActivityList(host) {
    const activityContainerElement = document.createElement("div");
    activityContainerElement.classList.add("tp-leaderboard");
    host.appendChild(activityContainerElement);

    const errorListElement = document.createElement("ul");
    activityContainerElement.appendChild(errorListElement);
    this.errorListElement = errorListElement;

    const activityListElement = document.createElement("ul");
    activityContainerElement.appendChild(activityListElement);
    this.activityListElement = activityListElement;
  }

  addActivityListItem(file) {
    const li = document.createElement("li");
    li.id = `file-${file.id}`;
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const div3 = document.createElement("div");

    const button = document.createElement("button");
    button.textContent = "x";
    button.addEventListener(
      "click",
      () => {
        this.removeFile(file);
      },
      { once: true }
    );

    div1.textContent = file.index;
    div1.setAttribute("title", div1.textContent);

    div2.textContent = file.id;
    div2.setAttribute("title", div2.textContent);

    div3.textContent = formatDate(new Date(file.time));
    div3.setAttribute("title", div3.textContent);

    li.appendChild(div1);
    li.appendChild(div2);
    li.appendChild(div3);
    li.appendChild(button);

    this.activityListElement.appendChild(li);
  }

  removeActivityListItem(file) {
    document.getElementById(`file-${file.id}`)?.remove();
  }

  addErrorListItem(file) {
    const li = document.createElement("li");
    li.id = `file-${file.id}`;
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const div3 = document.createElement("div");

    const button = document.createElement("button");
    button.textContent = "x";
    button.addEventListener(
      "click",
      () => {
        this.removeError(file);
      },
      { once: true }
    );

    li.classList.add("error");

    div1.textContent = "!";
    div1.setAttribute("title", div1.textContent);

    div2.textContent = file.id;
    div2.setAttribute("title", div2.textContent);

    div3.textContent = file.error;
    div3.setAttribute("title", div3.textContent);

    li.appendChild(div1);
    li.appendChild(div2);
    li.appendChild(div3);
    li.appendChild(button);

    this.errorListElement.appendChild(li);
  }

  removeErrorListItem(file) {
    document.getElementById(`file-${file.id}`)?.remove();
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
