const fs = require("fs");
const path = require("path");

function copyFolder(folderName, destFolderName) {
  fs.access(destFolderName, fs.F_OK, (err) => {
    fs.rm(destFolderName, { recursive: true }, (err) => {
      fs.mkdir(destFolderName, { recursive: true }, (err) => {
        if (err) throw err;
        fs.readdir(folderName, (err, files) => {
          files.forEach((fileName) => {
            fs.stat(path.join(folderName, fileName), (err, stats) => {
              if (!stats.isDirectory()) {
                const sourcePath = path.join(folderName, fileName);
                const destPath = path.join(destFolderName, fileName);
                fs.copyFile(sourcePath, destPath, (err) => {
                  if (err) throw err;
                });
                return;
              }

              const sourceFolder = path.join(folderName, fileName);
              const newFolderName = path.join(destFolderName, fileName);
              copyFolder(sourceFolder, newFolderName);
            });
          });
        });
      });
    });
  });
}

const sourceFolderName = path.join(__dirname, "files");
const destFolderName = path.join(__dirname, "files-copy");

copyFolder(sourceFolderName, destFolderName);
