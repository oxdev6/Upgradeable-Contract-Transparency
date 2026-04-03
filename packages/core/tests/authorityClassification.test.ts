import { describe, it, expect, beforeEach } from "vitest";
import { classifyAuthority } from "../src/authority/classifyAuthority";
import { createMockClient, resetMockClient, testAddress } from "./testHelpers";

describe("Authority classification", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("classifies EOA when getBytecode returns 0x", async () => {
    const admin = testAddress(1);

    mock.getBytecode.mockResolvedValueOnce("0x");

    const result = await classifyAuthority(mock.client, admin);

    expect(result.authorityAddress).toBe(admin);
    expect(result.authorityType).toBe("Externally Owned Account (EOA)");
  });

  it("classifies Timelock Controller when getMinDelay succeeds", async () => {
    const timelock = testAddress(10);
    const minDelay = 86_400n;

    mock.getBytecode.mockResolvedValueOnce("0x1234");
    mock.readContract.mockImplementation(async (args: any) => {
      if (args.functionName === "getMinDelay") return minDelay;
      throw new Error(`unexpected function ${args.functionName}`);
    });

    const result = await classifyAuthority(mock.client, timelock);

    expect(result.authorityAddress).toBe(timelock);
    expect(result.authorityType).toBe("Timelock Controller");
    expect(result.details?.[0]).toContain("Minimum Delay (seconds)");
  });

  it("classifies Gnosis Safe Multisig when getOwners/getThreshold succeed", async () => {
    const safe = testAddress(20);
    const owners = [testAddress(21), testAddress(22)];
    const threshold = 2n;

    mock.getBytecode.mockResolvedValueOnce("0x1234");
    mock.readContract.mockImplementation(async (args: any) => {
      if (args.functionName === "getMinDelay") throw new Error("not timelock");
      if (args.functionName === "getOwners") return owners;
      if (args.functionName === "getThreshold") return threshold;
      throw new Error(`unexpected function ${args.functionName}`);
    });

    const result = await classifyAuthority(mock.client, safe);

    expect(result.authorityAddress).toBe(safe);
    expect(result.authorityType).toBe("Gnosis Safe Multisig");
    expect(result.details?.some((d) => d.includes(`Owners: ${owners.length}`))).toBe(true);
  });

  it("falls back to Contract when neither timelock nor safe heuristics match", async () => {
    const contract = testAddress(30);

    mock.getBytecode.mockResolvedValueOnce("0x1234");
    mock.readContract.mockImplementation(async (args: any) => {
      if (args.functionName === "getMinDelay") throw new Error("not timelock");
      if (args.functionName === "getOwners") throw new Error("not safe");
      if (args.functionName === "getThreshold") throw new Error("not safe");
      throw new Error(`unexpected function ${args.functionName}`);
    });

    const result = await classifyAuthority(mock.client, contract);

    expect(result.authorityAddress).toBe(contract);
    expect(result.authorityType).toBe("Contract");
  });
});

