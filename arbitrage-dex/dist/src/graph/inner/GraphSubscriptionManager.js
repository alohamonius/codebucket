"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SubscriptionManager {
    constructor(mesh_, dexName_) {
        this.mesh_ = mesh_;
        this.dexName_ = dexName_;
        this._repeater = null;
        this._stopIteration = false;
        this._dexName = dexName_;
        this._mesh = mesh_;
    }
    async coldSubscription(document, variables, dexName, onStop, onData) {
        this._repeater = await this._mesh.subscribe(document, variables, {}, document.kind + this._dexName);
        const iterator = this._repeater[Symbol.asyncIterator]();
        const stop = async () => {
            await new Promise((resolve) => {
                var _a;
                console.debug(dexName, "live data end");
                this._stopIteration = true;
                (_a = iterator.return) === null || _a === void 0 ? void 0 : _a.call(iterator);
                resolve(onStop);
            });
        };
        const run = async () => {
            await new Promise(async (resolve) => {
                var _a;
                console.debug(dexName, "live data start");
                try {
                    while (!this._stopIteration) {
                        const { value, done } = await iterator.next();
                        if (done) {
                            break;
                        }
                        onData(value.data);
                    }
                }
                finally {
                    if (!this._stopIteration) {
                        (_a = iterator.return) === null || _a === void 0 ? void 0 : _a.call(iterator);
                        resolve();
                    }
                }
            });
        };
        return { stop, run };
    }
}
exports.default = SubscriptionManager;
