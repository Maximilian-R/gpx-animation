import { FileUploadView } from "./view.js";

export class FileUploadController {
  constructor(host, config) {
    this.value = config.value;
    this.viewProps = config.viewProps;

    this.view = new FileUploadView(host, {
      value: config.value,
      viewProps: this.viewProps,
    });
  }
}
