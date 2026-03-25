import type { PublicClient } from "viem";
import type { Address } from "../utils/rpc";

export type AdminClassification =
  | "Externally Owned Account (EOA)"
  | "Contract";

export interface AdminClassificationResult {
  authorityType: AdminClassification;
}

/**
 * Day 4: classify EOA vs contract admin.
 *
 * Heuristic: use `getBytecode()`:
 * - no deployed bytecode => EOA
 * - non-empty bytecode => contract
 */
export async function classifyAdmin(
  client: PublicClient,
  adminAddress: Address,
): Promise<AdminClassificationResult> {
  const bytecode = await client.getBytecode({ address: adminAddress });
  const isEOA = !bytecode || bytecode === "0x";

  return {
    authorityType: isEOA ? "Externally Owned Account (EOA)" : "Contract",
  };
}

