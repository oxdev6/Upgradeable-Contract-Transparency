import { describe, it, expect, beforeEach } from "vitest";
import { classifyAdmin } from "../src/authority/classifyAdmin";
import { createMockClient, resetMockClient, testAddress } from "./testHelpers";

describe("Admin classification", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("classifies EOA when bytecode is empty (0x)", async () => {
    const adminAddress = testAddress(1);
    mock.getBytecode.mockResolvedValueOnce("0x");

    const result = await classifyAdmin(mock.client, adminAddress);

    expect(result.authorityType).toBe("Externally Owned Account (EOA)");
  });

  it("classifies contract when bytecode is present", async () => {
    const adminAddress = testAddress(1);
    mock.getBytecode.mockResolvedValueOnce("0x1234");

    const result = await classifyAdmin(mock.client, adminAddress);

    expect(result.authorityType).toBe("Contract");
  });
});

