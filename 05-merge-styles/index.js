const fs = require("fs");
const path = require("path");

const distFile = path.join(__dirname, "project-dist", "bundle.css");
const sourceFolder = path.join(__dirname, "styles");

fs.readdir(sourceFolder, (err, files) => {
  if (err) throw err;

  const streamArray = files
    .filter((file) => {
      const fileNameChank = file.split(".");
      return fileNameChank.length === 2 && fileNameChank[1] === "css";
    })
    .map((file) => {
      const sourceFilePath = path.join(sourceFolder, file);
      return fs.createReadStream(sourceFilePath);
    });

  function readNext(streamArray, distStream) {
    const stream = streamArray.shift();

    if (stream !== undefined) {
      stream.on("end", () => {
        readNext(streamArray, distStream);
      });
      stream.pipe(distStream, { end: false });
    }
  }

  const distStream = fs.createWriteStream(distFile, { flags: "w" });
  readNext(streamArray, distStream);
});
