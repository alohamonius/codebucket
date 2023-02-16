var fs = require("fs");

export namespace Fs {
  export function isFileExistsAsync(path: string) {
    return new Promise(function (resolve, reject) {
      fs.exists(path, function (exists) {
        resolve(exists);
      });
    });
  }
  export function loadFileAsync<T>(path: string): Promise<T> {
    return new Promise((res, rej) => {
      fs.readFile(path, "utf-8", function (err, data) {
        if (err) {
          rej(err);
        }
        const accounts = JSON.parse(data) as T;
        res(accounts);
      });
    });
  }
  export function writeAsync(path: string, data: any): Promise<boolean> {
    return new Promise((res, rej) => {
      fs.writeFile(path, JSON.stringify(data), (err) => {
        if (err) res(false);
        console.log("Saved!");
      });
      res(true);
    });
  }

  export function updateAsync(
    path: string,
    publicKey: string,
    data: any
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, "utf8", (readErr, fileData) => {
        if (readErr) {
          resolve(false);
        } else {
          try {
            const parsedData = JSON.parse(fileData);
            const updatedData = parsedData.map((item) => {
              if (item.publicKey === publicKey) {
                return { ...item, ...data };
              }
              return item;
            });

            fs.writeFile(path, JSON.stringify(updatedData), (writeErr) => {
              if (writeErr) {
                resolve(false);
              } else {
                resolve(true);
              }
            });
          } catch (e) {
            resolve(false);
          }
        }
      });
    });
  }
}
