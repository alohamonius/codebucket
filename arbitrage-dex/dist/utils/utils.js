"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.mapData = exports.detectDexPairs = void 0;
function detectDexPairs(...objects) {
    objects.sort((a, b) => Object.keys(b).length - Object.keys(a).length);
    let items = [];
    for (let i = 0; i < objects.length; i++) {
        const exchangePairs = Object.keys(objects[i]);
        const current = objects[i][exchangePairs[0]][0];
        for (let j = i + 1; j < objects.length - 1; j++) {
            const compareToExchangePairs = Object.keys(objects[j]);
            const currentCompareTo = objects[j][compareToExchangePairs[0]][0];
            const samePairs = exchangePairs.filter((key) => compareToExchangePairs.includes(key));
            items.push({
                from: current.exchange,
                to: currentCompareTo.exchange,
                pairs: samePairs,
            });
        }
    }
    return items;
}
exports.detectDexPairs = detectDexPairs;
function mapData(data, exchange) {
    const dict = {};
    data.forEach((element) => {
        const key = toKey(element);
        const poolInfo = {
            id: element.id,
            price0: element.token0Price,
            price1: element.token1Price,
            pair: element.token0.symbol + "/" + element.token1.symbol,
            fee: element.feeTier ? parseFloat(element.feeTier) / 10000 : 0,
            exchange: exchange,
        };
        if (Object(dict).hasOwnProperty(key)) {
            console.log(key, "existed");
            dict[key].push(poolInfo);
        }
        else {
            dict[key] = [poolInfo];
        }
    });
    return dict;
}
exports.mapData = mapData;
function toKey(element) {
    return (element.token0.id + "_" + element.token1.id).toLowerCase();
}
function decKey(key) {
    const ids = key.split("_");
    return { token0Id: ids[0], token1Id: ids[1] };
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
