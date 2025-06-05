export async function parse(files, onProgress, onFail) {
  if (window.Worker) {
    const worker = new Worker("./parser/worker.js", {
      type: "module",
    });
    const parsedFiles = [];
    const promise = new Promise((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        if (typeof data === "boolean") {
          resolve(files);
        } else {
          try {
            parsedFiles.push(data);
          } catch (error) {
            console.log(error);
            onFail(data.index);
          }
          onProgress();
        }
      };
      worker.postMessage(files);
    });
    await promise;
    worker.terminate();

    return parsedFiles;
  } else {
    console.error("Web Worker not supported");
    throw Error();
  }
}
