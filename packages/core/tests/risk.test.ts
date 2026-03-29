import { describe, expect, it } from "vitest";
import { evaluateGovernanceRisk } from "../src/risk/evaluateGovernanceRisk";
import type { AuthorityChainNode } from "../src/authority/traceAuthorityChain";
import { testAddress } from "./testHelpers";

function node(
  addressIdx: number,
  authorityType: AuthorityChainNode["classification"]["authorityType"],
  details?: string[],
): AuthorityChainNode {
  return {
    address: testAddress(addressIdx),
    classification: {
      authorityAddress: testAddress(addressIdx),
      authorityType,
      details,
    },
  };
}

describe("evaluateGovernanceRisk", () => {
  it("returns VeryLow when not upgradeable", () => {
    const risk = evaluateGovernanceRisk(false, null);
    expect(risk.level).toBe("VeryLow");
    expect(risk.summary).toContain("not upgradeable");
  });

  it("returns Medium when upgradeable but chain missing", () => {
    const risk = evaluateGovernanceRisk(true, null);
    expect(risk.level).toBe("Medium");
    expect(risk.summary).toContain("undetermined");
  });

  it("returns Critical when ultimate authority is EOA", () => {
    const chain: AuthorityChainNode[] = [node(1, "Externally Owned Account (EOA)")];
    const risk = evaluateGovernanceRisk(true, chain);
    expect(risk.level).toBe("Critical");
    expect(risk.summary).toContain("single externally owned account");
    expect(risk.reasoning.some((r) => r.includes("Single key"))).toBe(true);
  });

  it("returns High for Safe-only chain (no timelock)", () => {
    const chain: AuthorityChainNode[] = [
      node(1, "Gnosis Safe Multisig", ["Owners: 5", "Threshold: 3"]),
    ];
    const risk = evaluateGovernanceRisk(true, chain);
    expect(risk.level).toBe("High");
    expect(risk.summary).toContain("multisig without timelock");
  });

  it("returns Low for Timelock then Safe", () => {
    const chain: AuthorityChainNode[] = [
      node(1, "Timelock Controller", ["Minimum Delay (seconds): 172800"]),
      node(2, "Gnosis Safe Multisig", ["Owners: 5", "Threshold: 3"]),
    ];
    const risk = evaluateGovernanceRisk(true, chain);
    expect(risk.level).toBe("Low");
    expect(risk.summary).toContain("timelock with multisig");
  });

  it("returns Low for Timelock-only chain", () => {
    const chain: AuthorityChainNode[] = [
      node(1, "Timelock Controller", ["Minimum Delay (seconds): 86400"]),
    ];
    const risk = evaluateGovernanceRisk(true, chain);
    expect(risk.level).toBe("Low");
    expect(risk.summary).toContain("timelock");
  });

  it("returns Medium for generic Contract ultimate", () => {
    const chain: AuthorityChainNode[] = [node(1, "Contract")];
    const risk = evaluateGovernanceRisk(true, chain);
    expect(risk.level).toBe("Medium");
    expect(risk.summary).toContain("undetermined governance");
  });

  it("returns Medium when ultimate is Contract even if timelock appears earlier", () => {
    const chain: AuthorityChainNode[] = [
      node(1, "Timelock Controller", ["Minimum Delay (seconds): 86400"]),
      node(2, "Contract"),
    ];
    const risk = evaluateGovernanceRisk(true, chain);
    expect(risk.level).toBe("Medium");
    expect(risk.summary).toContain("undetermined governance");
  });
});
