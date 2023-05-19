import * as fs from "fs-extra";
const fss = require("fs");
const sourceDir = "./src/graph/clients";
const targetDir = "dist/src/graph/clients";

fss.readdir(sourceDir, (err, files) => {
  for (const folder of files) {
    const sourcePath = `${sourceDir}/${folder}`;
    const targetPath = `${targetDir}/${folder}`;

    fs.copySync(sourcePath, targetPath);
    fs.removeSync(targetPath + "/node_modules");
    console.log(folder, "copied");
  }
  console.log("Copy completed.");
});
