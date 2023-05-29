import { GraphDataId } from "../../models/GraphId";
import { GraphPoolData } from "../../models/GraphPool";

export interface DexChainData {
  graphDataId: GraphDataId;
  data: GraphPoolData[];
}
