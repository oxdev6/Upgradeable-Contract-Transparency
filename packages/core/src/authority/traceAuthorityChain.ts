import type { PublicClient } from "viem";
import type { Address } from "../utils/rpc";
import type { AuthorityClassification } from "./classifyAuthority";
import { classifyAuthority } from "./classifyAuthority";

export interface AuthorityChainNode {
  address: Address;
  classification: AuthorityClassification;
}

/** Default max depth: nodes at depth 0, 1, 2 (three hops when fully expanded). */
export const DEFAULT_AUTHORITY_CHAIN_MAX_DEPTH = 2;

const OWNABLE_ABI = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

/** OpenZeppelin AccessControl `DEFAULT_ADMIN_ROLE` is the zero bytes32. */
const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

const ACCESS_CONTROL_ABI = [
  {
    type: "function",
    name: "getRoleMemberCount",
    stateMutability: "view",
    inputs: [{ name: "role", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getRoleMember",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

async function getOwnerIfPresent(
  client: PublicClient,
  address: Address,
): Promise<Address | null> {
  try {
    const owner = await client.readContract({
      address,
      abi: OWNABLE_ABI,
      functionName: "owner",
    });
    return owner as Address;
  } catch {
    return null;
  }
}

async function getDefaultAdminMember(
  client: PublicClient,
  address: Address,
): Promise<Address | null> {
  try {
    const count = (await client.readContract({
      address,
      abi: ACCESS_CONTROL_ABI,
      functionName: "getRoleMemberCount",
      args: [DEFAULT_ADMIN_ROLE],
    })) as bigint;

    if (count === 0n) return null;

    const member = (await client.readContract({
      address,
      abi: ACCESS_CONTROL_ABI,
      functionName: "getRoleMember",
      args: [DEFAULT_ADMIN_ROLE, 0n],
    })) as Address;

    return member;
  } catch {
    return null;
  }
}

/**
 * Resolve the next hop after a timelock or generic contract (e.g. admin of timelock, Ownable owner).
 * Stops at EOA and Gnosis Safe (no single “next” pointer in-chain).
 */
async function getNextAuthority(
  client: PublicClient,
  address: Address,
  classification: AuthorityClassification,
): Promise<Address | null> {
  if (classification.authorityType === "Externally Owned Account (EOA)") {
    return null;
  }
  if (classification.authorityType === "Gnosis Safe Multisig") {
    return null;
  }

  if (classification.authorityType === "Timelock Controller") {
    const fromRole = await getDefaultAdminMember(client, address);
    if (fromRole) return fromRole;
    return await getOwnerIfPresent(client, address);
  }

  return await getOwnerIfPresent(client, address);
}

/**
 * Trace upgrade authority from a starting address (typically the EIP-1967 admin),
 * up to `maxDepth` steps (depth 0 … maxDepth inclusive).
 *
 * Example path: Timelock → (DEFAULT_ADMIN_ROLE) → Safe → stop.
 */
export async function traceAuthorityChain(
  client: PublicClient,
  start: Address,
  maxDepth: number = DEFAULT_AUTHORITY_CHAIN_MAX_DEPTH,
): Promise<AuthorityChainNode[]> {
  const chain: AuthorityChainNode[] = [];
  const visited = new Set<string>();
  let current: Address | null = start;

  for (let depth = 0; depth <= maxDepth && current; depth++) {
    const key = current.toLowerCase();
    if (visited.has(key)) break;
    visited.add(key);

    const classification = await classifyAuthority(client, current);
    chain.push({ address: current, classification });

    const next = await getNextAuthority(client, current, classification);
    if (!next) break;
    current = next;
  }

  return chain;
}
