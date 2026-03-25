import type { Address } from "../utils/rpc";
import type { PublicClient } from "viem";

export interface GnosisSafeDetails {
  safeAddress: Address;
  owners: Address[];
  threshold: bigint;
}

const SAFE_ABI = [
  {
    type: "function",
    name: "getOwners",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "getThreshold",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * Day 5: detect Gnosis Safe multisig admin.
 *
 * Simple heuristic: if the contract responds to `getOwners()` and `getThreshold()`,
 * treat it as a Safe-like multisig.
 */
export async function detectGnosisSafe(
  client: PublicClient,
  contractAddress: Address,
): Promise<GnosisSafeDetails | null> {
  try {
    const [owners, threshold] = await Promise.all([
      client.readContract({
        address: contractAddress,
        abi: SAFE_ABI,
        functionName: "getOwners",
      }) as Promise<Address[]>,
      client.readContract({
        address: contractAddress,
        abi: SAFE_ABI,
        functionName: "getThreshold",
      }) as Promise<bigint>,
    ]);

    if (!Array.isArray(owners) || owners.length === 0) return null;
    if (typeof threshold !== "bigint") return null;
    if (threshold <= 0n) return null;
    if (threshold > BigInt(owners.length)) return null;

    return {
      safeAddress: contractAddress,
      owners,
      threshold,
    };
  } catch {
    return null;
  }
}

