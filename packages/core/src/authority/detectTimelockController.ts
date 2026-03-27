import type { PublicClient } from "viem";
import type { Address } from "../utils/rpc";

export interface TimelockControllerDetails {
  timelockAddress: Address;
  minDelay: bigint;
}

const TIMELOCK_ABI = [
  {
    type: "function",
    name: "getMinDelay",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * Day 6: detect timelock controllers.
 *
 * Simple heuristic: if the contract responds to `getMinDelay()`,
 * treat it as an OpenZeppelin-style TimelockController.
 */
export async function detectTimelockController(
  client: PublicClient,
  contractAddress: Address,
): Promise<TimelockControllerDetails | null> {
  try {
    const minDelay = (await client.readContract({
      address: contractAddress,
      abi: TIMELOCK_ABI,
      functionName: "getMinDelay",
    })) as bigint;

    if (typeof minDelay !== "bigint") return null;

    return {
      timelockAddress: contractAddress,
      minDelay,
    };
  } catch {
    return null;
  }
}

