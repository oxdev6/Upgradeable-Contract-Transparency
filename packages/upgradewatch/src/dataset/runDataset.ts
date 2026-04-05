import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ChainEndpoint } from "../chains";
import { generateUpgradeHistoryDataset } from "./generateUpgradeHistoryDataset";
import { DEFAULT_UPGRADE_DATASET_SEEDS } from "./seedContracts";

async function main() {
  const ethRpc = process.env.ETH_RPC;
  if (!ethRpc) {
    // eslint-disable-next-line no-console
    console.error("Missing ETH_RPC (Ethereum JSON-RPC URL).");
    process.exitCode = 1;
    return;
  }

  const endpoints: ChainEndpoint[] = [
    { chainId: 1, name: "Ethereum", rpcUrl: ethRpc },
  ];

  if (process.env.ARB_RPC) {
    endpoints.push({
      chainId: 42161,
      name: "Arbitrum One",
      rpcUrl: process.env.ARB_RPC,
    });
  }

  const fromBlock = process.env.FROM_BLOCK
    ? BigInt(process.env.FROM_BLOCK)
    : undefined;
  const toBlock = process.env.TO_BLOCK
    ? BigInt(process.env.TO_BLOCK)
    : undefined;

  const dataset = await generateUpgradeHistoryDataset(
    DEFAULT_UPGRADE_DATASET_SEEDS,
    endpoints,
    { fromBlock, toBlock },
    20,
  );

  // dist/dataset -> repo root is four levels up
  const repoRoot = resolve(__dirname, "../../../..");
  const outDir = resolve(repoRoot, "datasets");
  await mkdir(outDir, { recursive: true });
  const outFile = resolve(outDir, "upgrade-history-top20.json");
  await writeFile(outFile, `${JSON.stringify(dataset, null, 2)}\n`);

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outFile}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
