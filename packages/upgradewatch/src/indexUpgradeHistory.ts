import type { PublicClient } from "viem";
import type { ChainEndpoint } from "./chains";
import { createUpgradeWatchPublicClient } from "./createClient";
import {
  UPGRADE_EVENTS_ABI,
  parseUpgradeEventsFromLogs,
  type UpgradeParsedEvent,
} from "./parseUpgradeEvents";

export interface ChainUpgradeHistory {
  chainId: number;
  chainName: string;
  fromBlock: bigint;
  toBlock: bigint;
  events: UpgradeParsedEvent[];
}

export interface ContractUpgradeIndex {
  contract: `0x${string}`;
  chains: ChainUpgradeHistory[];
  indexedAt: string;
}

function sortLogs<T extends { blockNumber: bigint; logIndex: number }>(
  logs: T[],
): T[] {
  return [...logs].sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) {
      return a.blockNumber < b.blockNumber ? -1 : 1;
    }
    return a.logIndex - b.logIndex;
  });
}

export interface IndexUpgradeHistoryOptions {
  fromBlock?: bigint;
  toBlock?: bigint;
}

/**
 * Fetch and parse `Upgraded` / `AdminChanged` logs for one contract on one chain.
 */
export async function indexUpgradeHistoryForChain(
  client: PublicClient,
  endpoint: ChainEndpoint,
  contract: `0x${string}`,
  options: IndexUpgradeHistoryOptions = {},
): Promise<ChainUpgradeHistory> {
  const fromBlock = options.fromBlock ?? 0n;
  const toBlock = options.toBlock ?? (await client.getBlockNumber());

  const [upgradedLogs, adminLogs] = await Promise.all([
    client.getLogs({
      address: contract,
      event: UPGRADE_EVENTS_ABI[0],
      fromBlock,
      toBlock,
    }),
    client.getLogs({
      address: contract,
      event: UPGRADE_EVENTS_ABI[1],
      fromBlock,
      toBlock,
    }),
  ]);

  const merged = sortLogs([...upgradedLogs, ...adminLogs]);
  const events = parseUpgradeEventsFromLogs(merged);

  return {
    chainId: endpoint.chainId,
    chainName: endpoint.name,
    fromBlock,
    toBlock,
    events,
  };
}

/**
 * Index upgrade-related events for a contract across **1 or 2** RPC endpoints.
 */
export async function indexUpgradeHistory(
  contract: `0x${string}`,
  endpoints: readonly ChainEndpoint[],
  options: IndexUpgradeHistoryOptions = {},
): Promise<ContractUpgradeIndex> {
  if (endpoints.length < 1 || endpoints.length > 2) {
    throw new Error("Provide 1 or 2 chain endpoints");
  }

  const chains: ChainUpgradeHistory[] = [];

  for (const ep of endpoints) {
    const client = createUpgradeWatchPublicClient(ep);
    const history = await indexUpgradeHistoryForChain(
      client,
      ep,
      contract,
      options,
    );
    chains.push(history);
  }

  return {
    contract,
    chains,
    indexedAt: new Date().toISOString(),
  };
}
