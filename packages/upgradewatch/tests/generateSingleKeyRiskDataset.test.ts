import { describe, it, expect, vi } from "vitest";
import type { ProxyScopeJsonReport } from "@proxyscope/core";
import { generateSingleKeyRiskDataset } from "../src/dataset/generateSingleKeyRiskDataset";

function makeReport(
  overrides: Partial<ProxyScopeJsonReport>,
): ProxyScopeJsonReport {
  return {
    contract: {
      address: `0x${"1".repeat(40)}` as `0x${string}`,
      bytecodePresent: true,
    },
    proxy: {
      detected: true,
      type: "EIP-1967",
      implementation: { address: `0x${"2".repeat(40)}` as `0x${string}`, rawSlotValue: "0x" },
      admin: { address: `0x${"3".repeat(40)}` as `0x${string}`, rawSlotValue: "0x" },
    },
    upgradeAuthority: { depth: 1, chain: [] },
    analysis: {
      upgradeable: true,
      ultimateControllerType: "Externally Owned Account (EOA)",
      ultimateControllerAddress: `0x${"4".repeat(40)}` as `0x${string}`,
      notes: [],
    },
    risk: {
      level: "Critical",
      summary: "Upgrade authority is a single externally owned account",
      reasoning: [],
    },
    ...overrides,
  };
}

describe("generateSingleKeyRiskDataset", () => {
  it("keeps only contracts controlled by single EOA", async () => {
    const inspectFn = vi
      .fn()
      .mockResolvedValueOnce(makeReport({}))
      .mockResolvedValueOnce(
        makeReport({
          analysis: {
            upgradeable: true,
            ultimateControllerType: "Gnosis Safe Multisig",
            ultimateControllerAddress: `0x${"5".repeat(40)}` as `0x${string}`,
            notes: [],
          },
          risk: {
            level: "High",
            summary: "Upgrade authority is a multisig without timelock",
            reasoning: [],
          },
        }),
      );

    const dataset = await generateSingleKeyRiskDataset(
      [
        { label: "EOA-controlled", addresses: { 1: `0x${"a".repeat(40)}` as `0x${string}` } },
        { label: "Safe-controlled", addresses: { 1: `0x${"b".repeat(40)}` as `0x${string}` } },
      ],
      [{ chainId: 1, name: "Ethereum", rpcUrl: "https://example.invalid" }],
      inspectFn,
    );

    expect(dataset.entries).toHaveLength(1);
    expect(dataset.entries[0].label).toBe("EOA-controlled");
    expect(dataset.entries[0].riskLevel).toBe("Critical");
  });
});

