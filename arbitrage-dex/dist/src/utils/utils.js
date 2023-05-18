"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.getPairIds = exports.distinct = exports.toDictinary = exports.pairToPools = void 0;
function pairToPools(objects, uniquePairs) {
    let pairToPools = new Map();
    for (let i = 0; i < uniquePairs.length; i++) {
        const pair = uniquePairs[i];
        for (let j = 0; j < objects.length; j++) {
            const dexName = objects[j][0];
            const currentDexMap = objects[j][1];
            if (currentDexMap.has(pair)) {
                const pairData = currentDexMap.get(pair);
                if (pairToPools.has(pair)) {
                    const poolData = pairToPools.get(pair);
                    pairToPools.set(pair, poolData.concat(pairData));
                }
                else {
                    pairToPools.set(pair, pairData);
                }
            }
        }
    }
    return pairToPools;
}
exports.pairToPools = pairToPools;
function toDictinary(data, exchange) {
    const test = new Map();
    data.forEach((element) => {
        const key = toKey(element);
        const poolInfo = {
            poolId: element.id,
            token0Price: element.token0Price,
            token1Price: element.token1Price,
            pair: element.token0.symbol + "/" + element.token1.symbol,
            fee: element.feeTier ? parseFloat(element.feeTier) / 10000 : 0,
            dexName: exchange,
            totalVolumeUSD: element.volumeUSD,
            poolDayData: element.poolDayData,
        };
        test.has(key) ? test.get(key).push(poolInfo) : test.set(key, [poolInfo]);
    });
    return test;
}
exports.toDictinary = toDictinary;
function toKey(element) {
    return (element.token0.id + "_" + element.token1.id).toLowerCase();
}
function distinct(...arrays) {
    const combinedArray = [].concat(...arrays);
    return [...new Set(combinedArray)];
}
exports.distinct = distinct;
function getPairIds(pairs) {
    return pairs.map((d) => d.token0.id + "_" + d.token1.id);
}
exports.getPairIds = getPairIds;
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
