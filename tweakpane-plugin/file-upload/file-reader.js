const supportsFileSystemAccessAPI =
  "getAsFileSystemHandle" in DataTransferItem.prototype;
const supportsWebkitGetAsEntry =
  "webkitGetAsEntry" in DataTransferItem.prototype;

export async function readFiles(dataTransferItems) {
  const fileHandlesPromises = dataTransferItems
    .filter((item) => item.kind === "file")
    .map((item) =>
      supportsFileSystemAccessAPI
        ? item.getAsFileSystemHandle()
        : supportsWebkitGetAsEntry
        ? item.webkitGetAsEntry()
        : item.getAsFile()
    );
  const files = [];
  for await (const handle of fileHandlesPromises) {
    if (handle.kind === "directory" || handle.isDirectory) {
      console.log(`Directory: ${handle}`);
    } else {
      const file = await handle.getFile();
      const text = await file.text();
      files.push({ name: handle.name, text });
    }
  }

  return files;
}
