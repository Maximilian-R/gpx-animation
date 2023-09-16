import { Semver } from "https://unpkg.com/tweakpane@4.0.3/dist/tweakpane.js";
import { FileUploadController } from "./controller.js";

export const FileUploadPlugin = {
  core: new Semver("2.0.1"),
  id: "file-upload",
  type: "input",

  accept(value, params) {
    if (params.view !== "file-upload") {
      return null;
    }
    // Return a typed value and params to accept the user input
    return {
      initialValue: value,
      params: params,
    };
  },

  binding: {
    reader: () => (value) => value,
    writer: () => (target, value) => target.write(value),
  },

  controller(args) {
    return new FileUploadController(args.document, {
      value: args.value,
      viewProps: args.viewProps,
    });
  },
};
