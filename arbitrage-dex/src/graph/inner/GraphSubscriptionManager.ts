import { DocumentNode } from "graphql";
import { MeshInstance } from "@graphql-mesh/runtime";
export default class SubscriptionManager {
  private _repeater: any;
  private _stopIteration: boolean;
  private _dexName: string;
  private _mesh: MeshInstance;

  constructor(private mesh_: any, private dexName_: string) {
    this._repeater = null;
    this._stopIteration = false;
    this._dexName = dexName_;
    this._mesh = mesh_;
  }

  public async coldSubscription(
    document: DocumentNode,
    variables: any,
    dexName: string,
    onStop: any,
    onData: any
  ) {
    this._repeater = await this._mesh.subscribe(
      document,
      variables,
      {},
      document.kind + this._dexName
    );
    const iterator = this._repeater[Symbol.asyncIterator]();

    const stop = async () => {
      await new Promise<void>((resolve) => {
        console.debug(dexName, "live data end");
        this._stopIteration = true;
        iterator.return?.();
        resolve(onStop);
      });
    };

    const run = async () => {
      await new Promise<void>(async (resolve) => {
        console.debug(dexName, "live data start");
        try {
          while (!this._stopIteration) {
            const { value, done } = await iterator.next();

            if (done) {
              break;
            }

            onData(value.data);
          }
        } finally {
          if (!this._stopIteration) {
            iterator.return?.();
            resolve();
          }
        }
      });
    };
    return { stop, run };
  }
}
