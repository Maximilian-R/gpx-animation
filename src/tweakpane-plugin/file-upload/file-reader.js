const supportsFileSystemAccessAPI =
  "getAsFileSystemHandle" in DataTransferItem.prototype;
const supportsWebkitGetAsEntry =
  "webkitGetAsEntry" in DataTransferItem.prototype;

export async function readFiles(dataTransferItems) {
  const fileHandles = dataTransferItems
    .filter((item) => item.kind === "file")
    .map((item) =>
      supportsFileSystemAccessAPI
        ? item.getAsFileSystemHandle()
        : supportsWebkitGetAsEntry
        ? item.webkitGetAsEntry()
        : item.getAsFile()
    );
  const files = [];
  for await (const handle of fileHandles) {
    if (handle.kind === "directory" || handle.isDirectory) {
      console.log(`Directory: ${handle}`);
    } else {
      const file = await handle.getFile();
      files.push(file);
    }
  }

  return files;
}
