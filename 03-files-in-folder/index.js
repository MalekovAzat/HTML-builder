const fs = require("fs");
const path = require("path");

const folderName = path.join(...[__dirname, "secret-folder"]);
fs.readdir(folderName, (err, files) => {
  files.forEach((fileName) => {
    fs.stat(path.join(folderName, fileName), (err, stats) => {
      const [name, format] = fileName.split(".");
      const size = stats.size;
      if (!stats.isDirectory()) {
        console.log(`${name} - ${format} - ${size}`);
      }
    });
  });
});
