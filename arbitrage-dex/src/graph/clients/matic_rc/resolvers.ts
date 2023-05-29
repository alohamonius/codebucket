import { Resolvers, MeshContext } from "./.graphclient";

export const resolvers: Resolvers = {
  Pool: {
    chainName: (root, args, context, info) =>
      context.chainName || "bentobox-avalanche",
  },
};
