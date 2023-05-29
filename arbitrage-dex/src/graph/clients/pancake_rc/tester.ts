import { GetPoolsCakeDocument, execute } from "./.graphclient";

(async () => {
  const data = await execute(GetPoolsCakeDocument, {});
})();
