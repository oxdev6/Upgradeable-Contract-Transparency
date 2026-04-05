import { describe, it, expect, vi } from "vitest";
import type { Log } from "viem";
import {
  encodeAbiParameters,
  keccak256,
  pad,
  stringToBytes,
} from "viem";
import { indexUpgradeHistoryForChain } from "../src/indexUpgradeHistory";
import type { ChainEndpoint } from "../src/chains";

function addr(b: string): `0x${string}` {
  return `0x${b.repeat(40)}` as `0x${string}`;
}

describe("indexUpgradeHistoryForChain", () => {
  it("merges Upgraded and AdminChanged logs and parses them", async () => {
    const contract = addr("1");
    const impl = addr("2");
    const prev = addr("3");
    const next = addr("4");

    const upgradedTopic0 = keccak256(stringToBytes("Upgraded(address)"));
    const upgradedLog = {
      address: contract,
      blockHash: `0x${"a".repeat(64)}`,
      blockNumber: 10n,
      data: "0x",
      logIndex: 0,
      transactionHash: `0x${"b".repeat(64)}`,
      transactionIndex: 0,
      removed: false,
      topics: [upgradedTopic0, pad(impl, { size: 32 })],
    } as const satisfies Log;

    const adminTopic0 = keccak256(
      stringToBytes("AdminChanged(address,address)"),
    );
    const adminData = encodeAbiParameters(
      [
        { type: "address", name: "previousAdmin" },
        { type: "address", name: "newAdmin" },
      ],
      [prev, next],
    );
    const adminLog = {
      address: contract,
      blockHash: `0x${"c".repeat(64)}`,
      blockNumber: 11n,
      data: adminData,
      logIndex: 0,
      transactionHash: `0x${"d".repeat(64)}`,
      transactionIndex: 0,
      removed: false,
      topics: [adminTopic0],
    } as const satisfies Log;

    const getLogs = vi
      .fn()
      .mockImplementation(async (args: { event: { name: string } }) => {
        if (args.event.name === "Upgraded") return [upgradedLog];
        if (args.event.name === "AdminChanged") return [adminLog];
        return [];
      });

    const client = {
      getBlockNumber: vi.fn().mockResolvedValue(99n),
      getLogs,
    } as unknown as import("viem").PublicClient;

    const endpoint: ChainEndpoint = {
      chainId: 1,
      name: "Ethereum",
      rpcUrl: "https://example.invalid",
    };

    const history = await indexUpgradeHistoryForChain(
      client,
      endpoint,
      contract,
      { fromBlock: 0n, toBlock: 99n },
    );

    expect(history.chainId).toBe(1);
    expect(history.events).toHaveLength(2);
    expect(history.events[0].kind).toBe("Upgraded");
    expect(history.events[1].kind).toBe("AdminChanged");
    expect(getLogs).toHaveBeenCalledTimes(2);
  });
});
