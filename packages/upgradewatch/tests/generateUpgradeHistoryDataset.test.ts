import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { UpgradeParsedEvent } from "../src/parseUpgradeEvents";
import * as indexUpgradeHistory from "../src/indexUpgradeHistory";
import { generateUpgradeHistoryDataset } from "../src/dataset/generateUpgradeHistoryDataset";

function upgraded(n: number): UpgradeParsedEvent {
  return {
    kind: "Upgraded",
    contract: `0x${"1".repeat(40)}` as `0x${string}`,
    implementation: `0x${"2".repeat(40)}` as `0x${string}`,
    blockNumber: BigInt(n),
    logIndex: n,
    transactionHash: `0x${"a".repeat(64)}` as `0x${string}`,
  };
}

describe("generateUpgradeHistoryDataset", () => {
  const spy = vi.spyOn(indexUpgradeHistory, "indexUpgradeHistoryForChain");

  beforeEach(() => {
    spy.mockReset();
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("ranks contracts by total events and keeps top N", async () => {
    spy.mockImplementation(async (_client, endpoint, contract) => {
      const key = contract.toLowerCase();
      const count =
        key.endsWith("aa") ? 3 : key.endsWith("bb") ? 10 : key.endsWith("cc") ? 1 : 0;
      return {
        chainId: endpoint.chainId,
        chainName: endpoint.name,
        fromBlock: 0n,
        toBlock: 1n,
        events: Array.from({ length: count }, (_, i) => upgraded(i)),
      };
    });

    const dataset = await generateUpgradeHistoryDataset(
      [
        { label: "Low", addresses: { 1: `0x${"a".repeat(38)}aa` as `0x${string}` } },
        { label: "High", addresses: { 1: `0x${"a".repeat(38)}bb` as `0x${string}` } },
        { label: "Mid", addresses: { 1: `0x${"a".repeat(38)}cc` as `0x${string}` } },
      ],
      [{ chainId: 1, name: "Ethereum", rpcUrl: "https://x" }],
      { fromBlock: 0n, toBlock: 1n },
      2,
    );

    expect(dataset.entries).toHaveLength(2);
    expect(dataset.entries[0].label).toBe("High");
    expect(dataset.entries[0].totalEvents).toBe(10);
    expect(dataset.entries[1].label).toBe("Low");
    expect(dataset.entries[1].totalEvents).toBe(3);
  });
});
