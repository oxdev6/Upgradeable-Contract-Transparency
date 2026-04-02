import { describe, it, expect, beforeEach } from "vitest";
import { detectProxy } from "../src/proxy/detectProxy";
import {
  readAdminAddress,
  readImplementationAddress,
} from "../src/proxy/readSlots";
import { ADMIN_SLOT, IMPLEMENTATION_SLOT } from "../src/proxy/patterns";
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

  it("should detect different proxy states across multiple contracts", async () => {
    const proxyA = testAddress(101);
    const implA = testAddress(102);
    const adminA = testAddress(103);

    const proxyB = testAddress(201);

    const proxyC = testAddress(301);
    const implC = testAddress(302);

    const implASlotRaw = `0x${"0".repeat(24)}${implA.slice(2)}` as `0x${string}`;
    const adminASlotRaw = `0x${"0".repeat(24)}${adminA.slice(2)}` as `0x${string}`;
    const implCSlotRaw = `0x${"0".repeat(24)}${implC.slice(2)}` as `0x${string}`;

    mock.getStorageAt.mockImplementation(
      async (args: { address: string; slot: string }) => {
        if (args.address.toLowerCase() === proxyA.toLowerCase()) {
          if (args.slot.toLowerCase() === IMPLEMENTATION_SLOT.toLowerCase()) return implASlotRaw;
          if (args.slot.toLowerCase() === ADMIN_SLOT.toLowerCase()) return adminASlotRaw;
        }
        if (args.address.toLowerCase() === proxyB.toLowerCase()) {
          return "0x";
        }
        if (args.address.toLowerCase() === proxyC.toLowerCase()) {
          if (args.slot.toLowerCase() === IMPLEMENTATION_SLOT.toLowerCase()) return implCSlotRaw;
          if (args.slot.toLowerCase() === ADMIN_SLOT.toLowerCase()) return "0x";
        }
        return "0x";
      },
    );

    const resultA = await detectProxy(mock.client, proxyA);
    const resultB = await detectProxy(mock.client, proxyB);
    const resultC = await detectProxy(mock.client, proxyC);

    expect(resultA.isProxy).toBe(true);
    expect(resultA.implementationAddress?.toLowerCase()).toBe(implA.toLowerCase());
    expect(resultA.adminAddress?.toLowerCase()).toBe(adminA.toLowerCase());

    expect(resultB.isProxy).toBe(false);
    expect(resultB.proxyType).toBe("None");
    expect(resultB.implementationAddress).toBeNull();
    expect(resultB.adminAddress).toBeNull();

    expect(resultC.isProxy).toBe(true);
    expect(resultC.proxyType).toBe("EIP-1967");
    expect(resultC.implementationAddress?.toLowerCase()).toBe(implC.toLowerCase());
    expect(resultC.adminAddress).toBeNull();
  });

  it("should return not-proxy when implementation slot value is malformed", async () => {
    const proxyAddress = testAddress(401);
    mock.getStorageAt.mockResolvedValueOnce("0x1234");

    const result = await detectProxy(mock.client, proxyAddress);

    expect(result.isProxy).toBe(false);
    expect(result.proxyType).toBe("None");
    expect(result.implementationAddress).toBeNull();
    expect(result.adminAddress).toBeNull();
  });
});

