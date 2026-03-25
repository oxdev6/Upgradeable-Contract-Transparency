import { describe, it, expect, beforeEach } from "vitest";
import { detectProxy } from "../src/proxy/detectProxy";
import {
  readAdminAddress,
  readImplementationAddress,
} from "../src/proxy/readSlots";
import {
  createMockClient,
  resetMockClient,
  mockProxySlots,
  testAddress,
} from "./testHelpers";

describe("Proxy Detection", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("should detect EIP-1967 proxy with implementation and admin", async () => {
    const proxyAddress = testAddress(1);
    const implAddress = testAddress(2);
    const adminAddress = testAddress(3);

    mockProxySlots(mock, proxyAddress, implAddress, adminAddress);

    const result = await detectProxy(mock.client, proxyAddress);

    expect(result.isProxy).toBe(true);
    expect(result.proxyType).toBe("EIP-1967");
    expect(result.implementationAddress?.toLowerCase()).toBe(
      implAddress.toLowerCase(),
    );
    expect(result.adminAddress?.toLowerCase()).toBe(
      adminAddress.toLowerCase(),
    );
  });

  it("should return not a proxy when implementation slot is empty", async () => {
    const proxyAddress = testAddress(1);

    mockProxySlots(mock, proxyAddress, null, null);

    const result = await detectProxy(mock.client, proxyAddress);

    expect(result.isProxy).toBe(false);
    expect(result.proxyType).toBe("None");
    expect(result.implementationAddress).toBeNull();
    expect(result.adminAddress).toBeNull();
  });

  it("should detect proxy even when admin slot is empty", async () => {
    const proxyAddress = testAddress(1);
    const implAddress = testAddress(2);

    mockProxySlots(mock, proxyAddress, implAddress, null);

    const result = await detectProxy(mock.client, proxyAddress);

    expect(result.isProxy).toBe(true);
    expect(result.proxyType).toBe("EIP-1967");
    expect(result.implementationAddress?.toLowerCase()).toBe(
      implAddress.toLowerCase(),
    );
    expect(result.adminAddress).toBeNull();
  });

  it("should extract implementation address from EIP-1967 slot", async () => {
    const proxyAddress = testAddress(1);
    const implAddress = testAddress(2);

    const implSlotRaw = `0x${"0".repeat(24)}${implAddress.slice(2)}` as `0x${string}`;
    mock.getStorageAt.mockResolvedValueOnce(implSlotRaw);

    const { implementationAddress, implementationSlotRaw } =
      await readImplementationAddress(mock.client, proxyAddress);

    expect(implementationAddress?.toLowerCase()).toBe(implAddress.toLowerCase());
    expect(implementationSlotRaw).toBe(implSlotRaw);
  });

  it("should extract admin address from EIP-1967 slot", async () => {
    const proxyAddress = testAddress(1);
    const adminAddress = testAddress(3);

    const adminSlotRaw = `0x${"0".repeat(24)}${adminAddress.slice(2)}` as `0x${string}`;
    mock.getStorageAt.mockResolvedValueOnce(adminSlotRaw);

    const { adminAddress: resolvedAdminAddress, adminSlotRaw: raw } =
      await readAdminAddress(mock.client, proxyAddress);

    expect(resolvedAdminAddress?.toLowerCase()).toBe(adminAddress.toLowerCase());
    expect(raw).toBe(adminSlotRaw);
  });
});

