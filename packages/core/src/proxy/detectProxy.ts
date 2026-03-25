import type { GetStorageAtReturnType, PublicClient } from "viem";
import type { Address } from "../utils/rpc";
import { ADMIN_SLOT } from "./patterns";
import {
  bytes32SlotToAddress,
  readImplementationAddress,
} from "./readSlots";

export interface ProxyDetectionResult {
  isProxy: boolean;
  proxyType: "EIP-1967" | "None";
  implementationAddress: Address | null;
  adminAddress: Address | null;
  implementationSlotRaw: GetStorageAtReturnType | null;
  adminSlotRaw: GetStorageAtReturnType | null;
}

/**
 * Day 1: basic EIP-1967 proxy detection.
 *
 * A contract is treated as an EIP-1967 proxy if the implementation slot resolves
 * to a non-zero address.
 */
export async function detectProxy(
  client: PublicClient,
  contractAddress: Address,
): Promise<ProxyDetectionResult> {
  const { implementationAddress, implementationSlotRaw } =
    await readImplementationAddress(client, contractAddress);

  // If implementation is empty, it's not an EIP-1967 proxy.
  if (!implementationAddress) {
    return {
      isProxy: false,
      proxyType: "None",
      implementationAddress: null,
      adminAddress: null,
      implementationSlotRaw: null,
      adminSlotRaw: null,
    };
  }

  const adminSlotRaw = await client.getStorageAt({
    address: contractAddress,
    slot: ADMIN_SLOT,
  });
  const adminAddress = bytes32SlotToAddress(adminSlotRaw);

  return {
    isProxy: true,
    proxyType: "EIP-1967",
    implementationAddress,
    adminAddress,
    implementationSlotRaw,
    adminSlotRaw,
  };
}

