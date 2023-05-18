"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fs = void 0;
var fs = require("fs");
var Fs;
(function (Fs) {
    function isFileExistsAsync(path) {
        return new Promise(function (resolve, reject) {
            fs.exists(path, function (exists) {
                resolve(exists);
            });
        });
    }
    Fs.isFileExistsAsync = isFileExistsAsync;
    function loadFileAsync(path) {
        return new Promise((res, rej) => {
            fs.readFile(path, "utf-8", function (err, data) {
                if (err) {
                    rej(err);
                }
                const items = JSON.parse(data);
                res(items);
            });
        });
    }
    Fs.loadFileAsync = loadFileAsync;
    function writeAsync(path, data) {
        return new Promise((res, rej) => {
            fs.writeFile(path, JSON.stringify(data), (err) => {
                if (err)
                    rej(err);
                console.log("Saved!");
            });
            res(true);
        });
    }
    Fs.writeAsync = writeAsync;
    function updateAsync(path, publicKey, data) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, "utf8", (readErr, fileData) => {
                if (readErr) {
                    resolve(false);
                }
                else {
                    try {
                        const parsedData = JSON.parse(fileData);
                        const updatedData = parsedData.map((item) => {
                            if (item.publicKey === publicKey) {
                                return Object.assign(Object.assign({}, item), data);
                            }
                            return item;
                        });
                        fs.writeFile(path, JSON.stringify(updatedData), (writeErr) => {
                            if (writeErr) {
                                resolve(false);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    }
                    catch (e) {
                        resolve(false);
                    }
                }
            });
        });
    }
    Fs.updateAsync = updateAsync;
})(Fs = exports.Fs || (exports.Fs = {}));
