import { beforeEach, describe, expect, it } from "vitest";
import { detectTimelockController } from "../src/authority/detectTimelockController";
import { createMockClient, resetMockClient, testAddress } from "./testHelpers";

describe("Timelock controller detection", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("detects timelock when getMinDelay succeeds", async () => {
    const timelockAddress = testAddress(20);
    const minDelay = 172800n;
    mock.readContract.mockResolvedValueOnce(minDelay);

    const result = await detectTimelockController(mock.client, timelockAddress);

    expect(result).not.toBeNull();
    expect(result?.timelockAddress.toLowerCase()).toBe(
      timelockAddress.toLowerCase(),
    );
    expect(result?.minDelay).toBe(minDelay);
  });

  it("returns null when getMinDelay call fails", async () => {
    const notTimelockAddress = testAddress(21);
    mock.readContract.mockRejectedValueOnce(new Error("not timelock"));

    const result = await detectTimelockController(
      mock.client,
      notTimelockAddress,
    );

    expect(result).toBeNull();
  });
});

