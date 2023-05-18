"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utils_1 = require("../utils/utils");
const fs_module_1 = require("../utils/fs.module");
const path_1 = require("path");
describe("test", async () => {
    const uni3 = await fs_module_1.Fs.loadFileAsync((0, path_1.join)(__dirname, "/data/uniswapv3mini.json")); //4
    const sushi2 = await fs_module_1.Fs.loadFileAsync((0, path_1.join)(__dirname, "/data/sushiv2mini.json")); //6
    it("distinct in many arrays should work correct", async () => {
        const ids3 = (0, utils_1.getPairIds)(uni3);
        const ids2 = (0, utils_1.getPairIds)(sushi2);
        const uniquePairs = (0, utils_1.distinct)(ids2, ids3);
        (0, chai_1.assert)(uni3.length === 4, "uniswapv3mini.json file was changed");
        (0, chai_1.assert)(sushi2.length === 6, "sushiv2mini.json file was changed");
        (0, chai_1.assert)(uniquePairs.length === 7, "distinct works incorect");
    });
});
//хочу зробити тест для знаходження спільних пулів між різними дексами (detectDexPairs)
//logger typescript with DI
