import { describe, it, expect } from "vitest";
import type { Log } from "viem";
import {
  encodeAbiParameters,
  keccak256,
  pad,
  stringToBytes,
} from "viem";
import { parseUpgradeEventsFromLogs } from "../src/parseUpgradeEvents";

function hexAddr(byte: string): `0x${string}` {
  return `0x${byte.repeat(40)}` as `0x${string}`;
}

describe("parseUpgradeEventsFromLogs", () => {
  it("parses Upgraded(address indexed implementation)", () => {
    const proxy = hexAddr("1");
    const impl = hexAddr("2");

    const topic0 = keccak256(stringToBytes("Upgraded(address)"));
    const topic1 = pad(impl, { size: 32 });

    const log = {
      address: proxy,
      blockHash: `0x${"b".repeat(64)}`,
      blockNumber: 100n,
      data: "0x",
      logIndex: 3,
      transactionHash: `0x${"c".repeat(64)}`,
      transactionIndex: 0,
      removed: false,
      topics: [topic0, topic1],
    } as const satisfies Log;

    const events = parseUpgradeEventsFromLogs([log]);

    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("Upgraded");
    if (events[0].kind === "Upgraded") {
      expect(events[0].contract.toLowerCase()).toBe(proxy.toLowerCase());
      expect(events[0].implementation.toLowerCase()).toBe(impl.toLowerCase());
      expect(events[0].blockNumber).toBe(100n);
      expect(events[0].logIndex).toBe(3);
    }
  });

  it("parses AdminChanged(address previousAdmin, address newAdmin)", () => {
    const proxy = hexAddr("3");
    const prev = hexAddr("4");
    const next = hexAddr("5");

    const topic0 = keccak256(stringToBytes("AdminChanged(address,address)"));
    const data = encodeAbiParameters(
      [
        { type: "address", name: "previousAdmin" },
        { type: "address", name: "newAdmin" },
      ],
      [prev, next],
    );

    const log = {
      address: proxy,
      blockHash: `0x${"d".repeat(64)}`,
      blockNumber: 200n,
      data,
      logIndex: 1,
      transactionHash: `0x${"e".repeat(64)}`,
      transactionIndex: 0,
      removed: false,
      topics: [topic0],
    } as const satisfies Log;

    const events = parseUpgradeEventsFromLogs([log]);

    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("AdminChanged");
    if (events[0].kind === "AdminChanged") {
      expect(events[0].previousAdmin.toLowerCase()).toBe(prev.toLowerCase());
      expect(events[0].newAdmin.toLowerCase()).toBe(next.toLowerCase());
      expect(events[0].blockNumber).toBe(200n);
    }
  });

  it("ignores unrelated logs", () => {
    const log = {
      address: hexAddr("9"),
      blockHash: `0x${"f".repeat(64)}`,
      blockNumber: 1n,
      data: "0x",
      logIndex: 0,
      transactionHash: `0x${"1".repeat(64)}`,
      transactionIndex: 0,
      removed: false,
      topics: [keccak256(stringToBytes("Transfer(address,address,uint256)"))],
    } as const satisfies Log;

    expect(parseUpgradeEventsFromLogs([log])).toHaveLength(0);
  });
});
