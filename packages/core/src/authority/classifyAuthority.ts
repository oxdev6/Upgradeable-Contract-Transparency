import type { PublicClient } from "viem";
import type { Address } from "../utils/rpc";
import { detectGnosisSafe } from "./detectGnosisSafe";
import { detectTimelockController } from "./detectTimelockController";

export type AuthorityType =
  | "Externally Owned Account (EOA)"
  | "Gnosis Safe Multisig"
  | "Timelock Controller"
  | "Contract";

export interface AuthorityClassification {
  authorityAddress: Address;
  authorityType: AuthorityType;
  details?: string[];
}

/**
 * Classify an address as EOA, Timelock, Gnosis Safe, or generic contract.
 * Order: EOA → Timelock (OZ) → Safe → Contract.
 */
export async function classifyAuthority(
  client: PublicClient,
  address: Address,
): Promise<AuthorityClassification> {
  const bytecode = await client.getBytecode({ address });
  const isEoa = !bytecode || bytecode === "0x";

  if (isEoa) {
    return {
      authorityAddress: address,
      authorityType: "Externally Owned Account (EOA)",
    };
  }

  const timelock = await detectTimelockController(client, address);
  if (timelock) {
    const seconds = timelock.minDelay;
    const daysApprox = Number(seconds) / (60 * 60 * 24);
    return {
      authorityAddress: address,
      authorityType: "Timelock Controller",
      details: [
        `Minimum Delay (seconds): ${seconds.toString()}`,
        `Minimum Delay (approx days): ${daysApprox.toFixed(2)}`,
      ],
    };
  }

  const safe = await detectGnosisSafe(client, address);
  if (safe) {
    return {
      authorityAddress: address,
      authorityType: "Gnosis Safe Multisig",
      details: [
        `Owners: ${safe.owners.length}`,
        `Threshold: ${safe.threshold.toString()}`,
      ],
    };
  }

  return {
    authorityAddress: address,
    authorityType: "Contract",
  };
}
