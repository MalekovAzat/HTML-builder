const fs = require("fs");
const path = require("path");

const { readFile, mkdir, rm } = require("node:fs/promises");

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

(async () => {
  async function createBundle() {
    const distFolderPath = path.join(__dirname, "project-dist");

    await mkdir(distFolderPath, { recursive: true });

    const componentsFolderName = path.join(__dirname, "components");

    const componentsMap = new Map();
    let files = await fs.promises.readdir(componentsFolderName);

    for (const fileName of files) {
      const splitedName = fileName.split(".");
      if (splitedName.length === 2 && splitedName[1] === "html") {
        componentsMap.set(
          splitedName[0],
          await readFile(path.join(componentsFolderName, fileName), {
            encoding: "utf-8",
          })
        );
      }
    }

    const templateReadStream = fs.createReadStream(
      path.join(__dirname, "template.html"),
      { flags: "r", encoding: "utf-8" }
    );

    templateReadStream.on("data", (chunk) => {
      const substitutedStr = chunk.replace(/{{(.*?)}}/g, (m, key) => {
        if (!componentsMap.has(key)) {
          return "";
        }

        const componentData = componentsMap.get(key);
        return componentData;
      });

      const distIndexFileStream = fs.createWriteStream(
        path.join(distFolderPath, "index.html"),
        { flags: "a" }
      );

      distIndexFileStream.write(substitutedStr, (err) => {
        if (err) throw err;
        distIndexFileStream.close();
      });
    });

    fs.readdir(path.join(__dirname, "styles"), (err, files) => {
      if (err) throw err;

      const streamArray = files
        .filter((file) => {
          const fileNameChank = file.split(".");
          return fileNameChank.length === 2 && fileNameChank[1] === "css";
        })
        .map((file) => {
          const sourceFilePath = path.join(__dirname, "styles", file);
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

      const distStream = fs.createWriteStream(
        path.join(__dirname, "project-dist", "style.css"),
        { flags: "w" }
      );
      readNext(streamArray, distStream);
    });

    copyFolder(
      path.join(__dirname, "assets"),
      path.join(__dirname, "project-dist", "assets")
    );
  }

  createBundle();
})();
