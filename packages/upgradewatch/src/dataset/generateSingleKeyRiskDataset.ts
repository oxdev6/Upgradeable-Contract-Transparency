import type { PublicClient } from "viem";
import { inspectContractJson, type ProxyScopeJsonReport } from "@proxyscope/core";
import type { ChainEndpoint } from "../chains";
import { createUpgradeWatchPublicClient } from "../createClient";
import type { SeedContract } from "./seedContracts";

type InspectFn = (
  client: PublicClient,
  contract: `0x${string}`,
) => Promise<ProxyScopeJsonReport>;

export interface SingleKeyRiskDatasetEntry {
  rank: number;
  label: string;
  chainId: number;
  chainName: string;
  contract: `0x${string}`;
  admin: `0x${string}` | null;
  riskLevel: string;
  summary: string;
}

export interface SingleKeyRiskDataset {
  generatedAt: string;
  endpoints: Array<{ chainId: number; name: string }>;
  entries: SingleKeyRiskDatasetEntry[];
}

/**
 * Identify contracts where upgrade authority resolves to a single EOA.
 */
export async function generateSingleKeyRiskDataset(
  seeds: SeedContract[],
  endpoints: readonly ChainEndpoint[],
  inspectFn: InspectFn = inspectContractJson,
): Promise<SingleKeyRiskDataset> {
  if (endpoints.length < 1 || endpoints.length > 2) {
    throw new Error("Provide 1 or 2 chain endpoints");
  }

  const rows: Omit<SingleKeyRiskDatasetEntry, "rank">[] = [];

  for (const ep of endpoints) {
    const client = createUpgradeWatchPublicClient(ep);

    for (const seed of seeds) {
      const addr = seed.addresses[ep.chainId];
      if (!addr) continue;

      let report: ProxyScopeJsonReport;
      try {
        report = await inspectFn(client, addr);
      } catch {
        continue;
      }

      const isSingleKey =
        report.analysis.upgradeable &&
        report.analysis.ultimateControllerType ===
          "Externally Owned Account (EOA)";

      if (!isSingleKey) continue;

      rows.push({
        label: seed.label,
        chainId: ep.chainId,
        chainName: ep.name,
        contract: addr,
        admin: report.proxy.admin?.address ?? null,
        riskLevel: report.risk.level,
        summary: report.risk.summary,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.chainId !== b.chainId) return a.chainId - b.chainId;
    return a.label.localeCompare(b.label);
  });

  return {
    generatedAt: new Date().toISOString(),
    endpoints: endpoints.map((e) => ({ chainId: e.chainId, name: e.name })),
    entries: rows.map((r, i) => ({ rank: i + 1, ...r })),
  };
}

