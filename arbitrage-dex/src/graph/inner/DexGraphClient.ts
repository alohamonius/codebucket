import { DocumentNode } from "graphql";
import { getMesh, MeshInstance } from "@graphql-mesh/runtime";
import { findAndParseConfig } from "@graphql-mesh/cli";
import { join } from "path";
import SubscriptionManager from "./GraphSubscriptionManager";
//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-ethereum
//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-bsc
//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-polygon

//v2
//https://thegraph.com/hosted-service/subgraph/sushiswap/bsc-exchange
//https://thegraph.com/hosted-service/subgraph/sushiswap/exchange (eth)
//https://thegraph.com/hosted-service/subgraph/sushiswap/matic-exchange

//я хочу робити квері і отримувати ціни з sushi3,uni3 + sushi2,uni2 + suhi,uni
//в ідеалі з можливістю робити кросчейн (матік, бсц, ефір)
//хоча я ще не знайшов бсц і матік ендпоінт для юні

//ну от, є в мене список цін на дексах (1,2) лише двох.
//
export default class DexGraphClient {
  public dexName: string;
  private _mesh: MeshInstance;
  private _subscriptionManager: SubscriptionManager;
  private _document: DocumentNode;
  private _liveDocument: DocumentNode;
  private _stop: () => Promise<void>;
  private _run: () => Promise<void>;

  constructor(
    dexName_: string,
    mesh_: MeshInstance,
    document_: DocumentNode,
    liveDocument_: DocumentNode
  ) {
    this.dexName = dexName_;
    this._mesh = mesh_;
    this._document = document_;
    this._liveDocument = liveDocument_;
    this._subscriptionManager = new SubscriptionManager(
      this._mesh,
      this.dexName
    );
  }

  public static Create = async (
    dex: string,
    document: DocumentNode,
    liveDocument: DocumentNode
  ): Promise<DexGraphClient> => {
    const config = await findAndParseConfig({
      dir: join(__dirname, "../clients/" + dex + "_rc"),
      configName: "graphclient",
      additionalPackagePrefixes: ["@graphprotocol/client-"],
    });
    const mesh = await getMesh(config);
    return new DexGraphClient(dex, mesh, document, liveDocument);
  };

  public async fetch(filter: any) {
    const data = await this.execute(
      this._mesh,
      this._document,
      filter,
      this.dexName
    );
    return data;
  }

  public async subscribe(variables: any, onData: any, hot: boolean = true) {
    const { stop, run } = await this._subscriptionManager.coldSubscription(
      this._liveDocument,
      variables,
      this.dexName,
      () => {},
      onData
    );
    this._stop = stop;
    this._run = run;
    if (hot) await this._run();
  }
  public async stopLiveData() {
    await (this._stop ? this._stop() : Promise.resolve());
  }

  private async execute(
    mesh: MeshInstance,
    document: DocumentNode,
    vars: any,
    name: string
  ) {
    const { v2, v3 } = (await mesh.execute(document, vars)).data;
    return { v2, v3 };
  }
}
//   const pairs = detectDexPairs(
//     sushiswap.v2,
//     sushiswap.v3,
//     uniswap.v2,
//     uniswap.v3
//   );
// }
