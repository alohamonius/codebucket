"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SubscriptionManager {
    constructor(_mesh, _dexName) {
        this._mesh = _mesh;
        this._dexName = _dexName;
        this.repeater = null;
        this.stopIteration = false;
    }
    async subscribe(document, variables, onNewData) {
        var _a;
        this.repeater = await this._mesh.subscribe(document, variables, {}, document.kind + this._dexName);
        const iterator = this.repeater[Symbol.asyncIterator]();
        try {
            while (!this.stopIteration) {
                const { value, done } = await iterator.next();
                if (done) {
                    break;
                }
                onNewData(value.data);
            }
        }
        finally {
            if (!this.stopIteration) {
                (_a = iterator.return) === null || _a === void 0 ? void 0 : _a.call(iterator);
            }
        }
    }
    stop() {
        var _a, _b;
        this.stopIteration = true;
        (_b = (_a = this.repeater) === null || _a === void 0 ? void 0 : _a.return) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
}
exports.default = SubscriptionManager;
