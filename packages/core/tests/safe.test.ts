import { describe, it, expect, beforeEach } from "vitest";
import { detectGnosisSafe } from "../src/authority/detectGnosisSafe";
import { createMockClient, resetMockClient, testAddress } from "./testHelpers";

describe("Gnosis Safe detection", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("detects a Safe when getOwners and getThreshold succeed", async () => {
    const safeAddress = testAddress(10);
    const owners = [testAddress(1), testAddress(2), testAddress(3)];
    const threshold = 2n;

    // detectGnosisSafe calls readContract twice via Promise.all
    mock.readContract.mockResolvedValueOnce(owners);
    mock.readContract.mockResolvedValueOnce(threshold);

    const result = await detectGnosisSafe(mock.client, safeAddress);

    expect(result).not.toBeNull();
    expect(result?.safeAddress.toLowerCase()).toBe(safeAddress.toLowerCase());
    expect(result?.owners.map((o) => o.toLowerCase())).toEqual(
      owners.map((o) => o.toLowerCase()),
    );
    expect(result?.threshold).toBe(threshold);
  });

  it("returns null when readContract fails", async () => {
    const safeAddress = testAddress(10);
    mock.readContract.mockRejectedValueOnce(new Error("not a safe"));

    const result = await detectGnosisSafe(mock.client, safeAddress);
    expect(result).toBeNull();
  });
});

