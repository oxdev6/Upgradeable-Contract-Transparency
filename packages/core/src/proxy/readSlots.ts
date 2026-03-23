import { getAddress, type GetStorageAtReturnType } from "viem";
import type { Address } from "../utils/rpc";

export function bytes32SlotToAddress(
  value: GetStorageAtReturnType | null | undefined,
): Address | null {
  if (!value || value === "0x" || /^0x0+$/i.test(value)) return null;

  // Take the last 20 bytes of the 32-byte slot
  const hex = value.toLowerCase();
  const stripped = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (stripped.length !== 64) return null;

  const rawAddress = `0x${stripped.slice(24)}` as Address;
  try {
    return getAddress(rawAddress);
  } catch {
    return null;
  }
}

