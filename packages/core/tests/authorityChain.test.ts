import { beforeEach, describe, expect, it } from "vitest";
import { traceAuthorityChain } from "../src/authority/traceAuthorityChain";
import { createMockClient, resetMockClient, testAddress } from "./testHelpers";

describe("traceAuthorityChain (depth 2)", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("returns a single EOA node when admin has no bytecode", async () => {
    const eoa = testAddress(1);
    mock.getBytecode.mockResolvedValueOnce("0x");

    const chain = await traceAuthorityChain(mock.client, eoa, 2);

    expect(chain).toHaveLength(1);
    expect(chain[0].address.toLowerCase()).toBe(eoa.toLowerCase());
    expect(chain[0].classification.authorityType).toBe(
      "Externally Owned Account (EOA)",
    );
  });

  it("maps Timelock → Safe when timelock exposes DEFAULT_ADMIN_ROLE member", async () => {
    const timelock = testAddress(10);
    const safe = testAddress(20);
    const owners = [testAddress(21), testAddress(22)];
    const threshold = 2n;

    let minDelayCalls = 0;
    mock.getBytecode.mockImplementation(async () => "0xabcd" as `0x${string}`);

    mock.readContract.mockImplementation(async (args: { functionName: string }) => {
      const fn = args.functionName;
      if (fn === "getMinDelay") {
        minDelayCalls += 1;
        if (minDelayCalls === 1) return 86_400n;
        throw new Error("not a timelock");
      }
      if (fn === "getRoleMemberCount") return 1n;
      if (fn === "getRoleMember") return safe;
      if (fn === "getOwners") return owners;
      if (fn === "getThreshold") return threshold;
      throw new Error(`unexpected ${fn}`);
    });

    const chain = await traceAuthorityChain(mock.client, timelock, 2);

    expect(chain).toHaveLength(2);
    expect(chain[0].classification.authorityType).toBe("Timelock Controller");
    expect(chain[1].address.toLowerCase()).toBe(safe.toLowerCase());
    expect(chain[1].classification.authorityType).toBe(
      "Gnosis Safe Multisig",
    );
  });

  it("follows Ownable owner from generic contract when not timelock/safe", async () => {
    const contract = testAddress(30);
    const owner = testAddress(31);

    let bytecodeCalls = 0;
    mock.getBytecode.mockImplementation(async () => {
      bytecodeCalls += 1;
      return bytecodeCalls === 1
        ? ("0x1234" as `0x${string}`)
        : ("0x" as `0x${string}`);
    });

    mock.readContract.mockImplementation(async (args: { functionName: string }) => {
      const fn = args.functionName;
      if (fn === "getMinDelay") throw new Error("not timelock");
      if (fn === "getOwners") throw new Error("not safe");
      if (fn === "getThreshold") throw new Error("not safe");
      if (fn === "owner") return owner;
      throw new Error(`unexpected ${fn}`);
    });

    const chain = await traceAuthorityChain(mock.client, contract, 2);

    expect(chain).toHaveLength(2);
    expect(chain[0].classification.authorityType).toBe("Contract");
    expect(chain[1].classification.authorityType).toBe(
      "Externally Owned Account (EOA)",
    );
    expect(chain[1].address.toLowerCase()).toBe(owner.toLowerCase());
  });
});
