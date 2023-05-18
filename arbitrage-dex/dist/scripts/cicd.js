const fs = require("fs");
const { exec } = require("child_process");
const parentFolder = "./"; // Replace with the path to your parent folder
fs.readdir(parentFolder, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }
    const clientFolders = files.filter((file) => fs.statSync(`${parentFolder}/${file}`).isDirectory() &&
        file.endsWith("_rc"));
    clientFolders.forEach((folder) => {
        const folderPath = `${parentFolder}/${folder}`;
        exec("npm run codegen", { cwd: folderPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running 'npm run codegen' in ${folderPath}:`, error);
            }
            else {
                console.log(`'npm run codegen' executed successfully in ${folderPath}`);
            }
            console.log(stdout);
            console.error(stderr);
        });
    });
});
