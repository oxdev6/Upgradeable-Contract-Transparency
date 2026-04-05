import { parseEventLogs, type Log } from "viem";

/**
 * OpenZeppelin-style proxy upgrade events (EIP-1967–related deployments).
 */
export const UPGRADE_EVENTS_ABI = [
  {
    type: "event",
    name: "Upgraded",
    inputs: [{ name: "implementation", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "AdminChanged",
    inputs: [
      { name: "previousAdmin", type: "address", indexed: false },
      { name: "newAdmin", type: "address", indexed: false },
    ],
  },
] as const;

export type UpgradeParsedEvent =
  | {
      kind: "Upgraded";
      contract: `0x${string}`;
      implementation: `0x${string}`;
      blockNumber: bigint;
      logIndex: number;
      transactionHash: `0x${string}`;
    }
  | {
      kind: "AdminChanged";
      contract: `0x${string}`;
      previousAdmin: `0x${string}`;
      newAdmin: `0x${string}`;
      blockNumber: bigint;
      logIndex: number;
      transactionHash: `0x${string}`;
    };

/**
 * Parse `Upgraded` and `AdminChanged` logs into a stable integration shape.
 */
export function parseUpgradeEventsFromLogs(
  logs: readonly Log[],
): UpgradeParsedEvent[] {
  const decoded = parseEventLogs({
    abi: UPGRADE_EVENTS_ABI,
    logs: [...logs],
  });

  return decoded.map((event) => {
    if (event.eventName === "Upgraded") {
      return {
        kind: "Upgraded",
        contract: event.address,
        implementation: event.args.implementation,
        blockNumber: event.blockNumber,
        logIndex: Number(event.logIndex),
        transactionHash: event.transactionHash,
      };
    }

    return {
      kind: "AdminChanged",
      contract: event.address,
      previousAdmin: event.args.previousAdmin,
      newAdmin: event.args.newAdmin,
      blockNumber: event.blockNumber,
      logIndex: Number(event.logIndex),
      transactionHash: event.transactionHash,
    };
  });
}
