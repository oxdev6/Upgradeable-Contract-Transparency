import { vi, type Mock } from "vitest";
import type { PublicClient } from "viem";
import type { Address } from "../src/utils/rpc";

export interface MockClient {
  client: PublicClient;
  getStorageAt: Mock;
  getBytecode: Mock;
  readContract: Mock;
}

export function createMockClient(): MockClient {
  const getStorageAt = vi.fn();
  const getBytecode = vi.fn();
  const readContract = vi.fn();
  const client = {
    getStorageAt,
    getBytecode,
    readContract,
  } as unknown as PublicClient;
  return { client, getStorageAt, getBytecode, readContract };
}

export function resetMockClient(mock: MockClient): void {
  mock.getStorageAt.mockReset();
  mock.getBytecode.mockReset();
  mock.readContract.mockReset();
}

/**
 * Mocks EIP-1967 proxy storage slots.
 * Formats addresses correctly as 32-byte slot values (last 20 bytes).
 */
export function mockProxySlots(
  mock: MockClient,
  proxyAddress: Address,
  implementationAddress: Address | null,
  adminAddress: Address | null,
): void {
  const implSlotRaw = implementationAddress
    ? (`0x${"0".repeat(24)}${implementationAddress.slice(2)}` as const)
    : ("0x" as const);
  const adminSlotRaw = adminAddress
    ? (`0x${"0".repeat(24)}${adminAddress.slice(2)}` as const)
    : ("0x" as const);

  // detectProxy calls getStorageAt twice: implementation slot, then admin slot.
  mock.getStorageAt.mockResolvedValueOnce(implSlotRaw);
  mock.getStorageAt.mockResolvedValueOnce(adminSlotRaw);
}

export function testAddress(index: number): Address {
  const hex = index.toString(16).padStart(40, "0");
  return `0x${hex}` as Address;
}

