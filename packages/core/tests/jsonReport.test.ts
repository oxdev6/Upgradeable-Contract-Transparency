import { beforeEach, describe, expect, it } from "vitest";
import { inspectContractJson } from "../src/report/inspectContractJson";
import { createMockClient, resetMockClient, testAddress } from "./testHelpers";

describe("inspectContractJson", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("returns non-upgradeable JSON when bytecode is absent", async () => {
    const target = testAddress(1);
    mock.getBytecode.mockResolvedValueOnce("0x");

    const report = await inspectContractJson(mock.client, target);

    expect(report.contract.bytecodePresent).toBe(false);
    expect(report.proxy.detected).toBe(false);
    expect(report.analysis.upgradeable).toBe(false);
    expect(report.risk.level).toBe("VeryLow");
  });

  it("returns non-proxy JSON when implementation slot is empty", async () => {
    const target = testAddress(1);
    mock.getBytecode.mockResolvedValueOnce("0x1234");
    // detectProxy -> readImplementationAddress
    mock.getStorageAt.mockResolvedValueOnce("0x");

    const report = await inspectContractJson(mock.client, target);

    expect(report.contract.bytecodePresent).toBe(true);
    expect(report.proxy.detected).toBe(false);
    expect(report.analysis.upgradeable).toBe(false);
    expect(report.upgradeAuthority.depth).toBe(0);
  });

  it("returns proxy JSON with authority chain and risk", async () => {
    const proxy = testAddress(10);
    const impl = testAddress(11);
    const admin = testAddress(12); // EOA

    mock.getBytecode
      // 1) inspectContractJson bytecode check for target
      .mockResolvedValueOnce("0x1234")
      // 2) classifyAuthority bytecode check for admin
      .mockResolvedValueOnce("0x");

    const implSlotRaw = `0x${"0".repeat(24)}${impl.slice(2)}` as `0x${string}`;
    const adminSlotRaw = `0x${"0".repeat(24)}${admin.slice(2)}` as `0x${string}`;
    mock.getStorageAt.mockResolvedValueOnce(implSlotRaw).mockResolvedValueOnce(adminSlotRaw);

    const report = await inspectContractJson(mock.client, proxy);

    expect(report.proxy.detected).toBe(true);
    expect(report.proxy.implementation?.address?.toLowerCase()).toBe(
      impl.toLowerCase(),
    );
    expect(report.proxy.admin?.address?.toLowerCase()).toBe(admin.toLowerCase());
    expect(report.upgradeAuthority.depth).toBe(1);
    expect(report.upgradeAuthority.chain[0].type).toBe(
      "Externally Owned Account (EOA)",
    );
    expect(report.risk.level).toBe("Critical");
  });
});

