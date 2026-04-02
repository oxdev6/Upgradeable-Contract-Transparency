import type { PublicClient } from "viem";
import type { Address } from "../utils/rpc";
import { detectProxy } from "../proxy/detectProxy";
import { traceAuthorityChain, type AuthorityChainNode } from "../authority/traceAuthorityChain";
import { evaluateGovernanceRisk } from "../risk/evaluateGovernanceRisk";
import type { GovernanceRisk } from "../risk/riskModel";

export interface JsonAuthorityNode {
  address: Address;
  type: string;
  details?: string[];
}

export interface ProxyScopeJsonReport {
  contract: {
    address: Address;
    bytecodePresent: boolean;
  };
  proxy: {
    detected: boolean;
    type: string | null;
    implementation: {
      address: Address | null;
      rawSlotValue: string | null;
    } | null;
    admin: {
      address: Address | null;
      rawSlotValue: string | null;
    } | null;
  };
  upgradeAuthority: {
    depth: number;
    chain: JsonAuthorityNode[];
  };
  analysis: {
    upgradeable: boolean;
    ultimateControllerType: string | null;
    ultimateControllerAddress: Address | null;
    notes: string[];
  };
  risk: GovernanceRisk;
}

function chainToJson(chain: AuthorityChainNode[]): JsonAuthorityNode[] {
  return chain.map((n) => ({
    address: n.address,
    type: n.classification.authorityType,
    details: n.classification.details,
  }));
}

/**
 * Day 10: structured JSON output format for integrations.
 */
export async function inspectContractJson(
  client: PublicClient,
  contractAddress: Address,
): Promise<ProxyScopeJsonReport> {
  const bytecode = await client.getBytecode({ address: contractAddress });
  const bytecodePresent = !!bytecode && bytecode !== "0x";

  if (!bytecodePresent) {
    const risk = evaluateGovernanceRisk(false, null);
    return {
      contract: {
        address: contractAddress,
        bytecodePresent: false,
      },
      proxy: {
        detected: false,
        type: null,
        implementation: null,
        admin: null,
      },
      upgradeAuthority: {
        depth: 0,
        chain: [],
      },
      analysis: {
        upgradeable: false,
        ultimateControllerType: null,
        ultimateControllerAddress: null,
        notes: [
          "No contract bytecode found at target address.",
          "Target is likely an EOA or unused address.",
        ],
      },
      risk,
    };
  }

  const proxy = await detectProxy(client, contractAddress);
  if (!proxy.isProxy) {
    const risk = evaluateGovernanceRisk(false, null);
    return {
      contract: {
        address: contractAddress,
        bytecodePresent: true,
      },
      proxy: {
        detected: false,
        type: null,
        implementation: null,
        admin: null,
      },
      upgradeAuthority: {
        depth: 0,
        chain: [],
      },
      analysis: {
        upgradeable: false,
        ultimateControllerType: null,
        ultimateControllerAddress: null,
        notes: [
          "Not detected as an EIP-1967 proxy.",
          "Other proxy patterns may exist but are not yet supported.",
        ],
      },
      risk,
    };
  }

  const chain =
    proxy.adminAddress !== null
      ? await traceAuthorityChain(client, proxy.adminAddress)
      : [];
  const risk = evaluateGovernanceRisk(true, chain);
  const chainJson = chainToJson(chain);
  const ultimate = chain.length > 0 ? chain[chain.length - 1] : null;

  return {
    contract: {
      address: contractAddress,
      bytecodePresent: true,
    },
    proxy: {
      detected: true,
      type: proxy.proxyType,
      implementation: {
        address: proxy.implementationAddress,
        rawSlotValue: proxy.implementationSlotRaw as string | null,
      },
      admin: {
        address: proxy.adminAddress,
        rawSlotValue: proxy.adminSlotRaw as string | null,
      },
    },
    upgradeAuthority: {
      depth: chainJson.length,
      chain: chainJson,
    },
    analysis: {
      upgradeable: true,
      ultimateControllerType: ultimate?.classification.authorityType ?? null,
      ultimateControllerAddress: ultimate?.address ?? null,
      notes: ["Structured JSON output for integrations."],
    },
    risk,
  };
}

