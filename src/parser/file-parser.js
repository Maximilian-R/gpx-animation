export async function parse(files, onProgress, onFail) {
  if (window.Worker) {
    const worker = new Worker("./parser/worker.js", {
      type: "module",
    });
    const parsedFiles = [];
    const promise = new Promise((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        if (data.event === "complete") {
          resolve();
        } else if (data.event === "error") {
          console.error(data.error);
          onFail(data.index, data.error.message);
          onProgress();
        } else if (data.event === "parsed") {
          parsedFiles.push(data.object);
          onProgress(data.object);
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
