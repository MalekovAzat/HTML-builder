const fs = require("fs");
const path = require("path");

const writeFileName = path.join(...[__dirname, "output.txt"]);

const writeStream = fs.createWriteStream(writeFileName, { flags: "a+" });
const stopWord = "exit\n";

process.stdin.on("data", (chunk) => {
  const chunkStr = chunk.toString();

  if (chunkStr === stopWord) {
    console.log("\nThe last world");
    process.exit(0);
  }
  writeStream.write(chunkStr);
});

process.on("SIGINT", () => {
  console.log("\nThe last world");
  process.exit(0);
});
