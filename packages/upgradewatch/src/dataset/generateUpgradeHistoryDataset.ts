import type { ChainEndpoint } from "../chains";
import { createUpgradeWatchPublicClient } from "../createClient";
import {
  indexUpgradeHistoryForChain,
  type IndexUpgradeHistoryOptions,
} from "../indexUpgradeHistory";
import type { UpgradeParsedEvent } from "../parseUpgradeEvents";
import type { SeedContract } from "./seedContracts";

function serializeEvent(event: UpgradeParsedEvent) {
  return {
    ...event,
    blockNumber: event.blockNumber.toString(),
  };
}

export interface UpgradeHistoryDatasetEntry {
  rank: number;
  label: string;
  /** Representative address (prefer Ethereum mainnet if present). */
  address: `0x${string}` | null;
  totalEvents: number;
  chains: Array<{
    chainId: number;
    chainName: string;
    eventCount: number;
    events: ReturnType<typeof serializeEvent>[];
  }>;
}

export interface UpgradeHistoryDataset {
  generatedAt: string;
  topN: number;
  endpoints: Array<{ chainId: number; name: string }>;
  entries: UpgradeHistoryDatasetEntry[];
}

/**
 * Index many contracts across 1–2 chains, rank by total upgrade events, keep top N.
 */
export async function generateUpgradeHistoryDataset(
  seeds: SeedContract[],
  endpoints: readonly ChainEndpoint[],
  options: IndexUpgradeHistoryOptions = {},
  topN = 20,
): Promise<UpgradeHistoryDataset> {
  if (endpoints.length < 1 || endpoints.length > 2) {
    throw new Error("Provide 1 or 2 chain endpoints");
  }

  const rows: Array<{
    label: string;
    representative: `0x${string}` | null;
    totalEvents: number;
    chains: UpgradeHistoryDatasetEntry["chains"];
  }> = [];

  for (const seed of seeds) {
    const chainSlices: UpgradeHistoryDatasetEntry["chains"] = [];
    let total = 0;
    let representative: `0x${string}` | null =
      seed.addresses[1] ?? Object.values(seed.addresses)[0] ?? null;

    for (const ep of endpoints) {
      const addr = seed.addresses[ep.chainId];
      if (!addr) continue;

      const client = createUpgradeWatchPublicClient(ep);
      const history = await indexUpgradeHistoryForChain(
        client,
        ep,
        addr,
        options,
      );
      total += history.events.length;
      chainSlices.push({
        chainId: history.chainId,
        chainName: history.chainName,
        eventCount: history.events.length,
        events: history.events.map(serializeEvent),
      });
    }

    rows.push({
      label: seed.label,
      representative,
      totalEvents: total,
      chains: chainSlices,
    });
  }

  rows.sort((a, b) => b.totalEvents - a.totalEvents);

  const top = rows.slice(0, topN);

  return {
    generatedAt: new Date().toISOString(),
    topN,
    endpoints: endpoints.map((e) => ({ chainId: e.chainId, name: e.name })),
    entries: top.map((r, i) => ({
      rank: i + 1,
      label: r.label,
      address: r.representative,
      totalEvents: r.totalEvents,
      chains: r.chains,
    })),
  };
}
