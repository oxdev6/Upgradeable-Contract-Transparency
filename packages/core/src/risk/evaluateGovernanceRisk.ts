import type { AuthorityChainNode } from "../authority/traceAuthorityChain";
import type { AuthorityType } from "../authority/classifyAuthority";
import type { GovernanceRisk } from "./riskModel";

function chainHasTimelock(chain: AuthorityChainNode[]): boolean {
  return chain.some(
    (n) => n.classification.authorityType === "Timelock Controller",
  );
}

function chainHasSafe(chain: AuthorityChainNode[]): boolean {
  return chain.some(
    (n) => n.classification.authorityType === "Gnosis Safe Multisig",
  );
}

function ultimateAuthorityType(
  chain: AuthorityChainNode[],
): AuthorityType | null {
  if (chain.length === 0) return null;
  return chain[chain.length - 1].classification.authorityType;
}

/**
 * Deterministic governance risk from upgradeability and traced authority chain.
 * Levels: VeryLow → Critical based on ultimate control type and presence of timelock / multisig.
 */
export function evaluateGovernanceRisk(
  upgradeable: boolean,
  chain: AuthorityChainNode[] | null,
): GovernanceRisk {
  if (!upgradeable) {
    return {
      level: "VeryLow",
      summary: "Contract is not upgradeable",
      reasoning: [
        "No proxy pattern detected at this address.",
        "Contract logic cannot be upgraded without redeployment.",
      ],
    };
  }

  if (!chain || chain.length === 0) {
    return {
      level: "Medium",
      summary: "Upgrade authority pattern undetermined",
      reasoning: [
        "Proxy detected but upgrade authority could not be resolved.",
        "Governance pattern requires manual review.",
      ],
    };
  }

  const ultimateType = ultimateAuthorityType(chain);
  const hasTimelock = chainHasTimelock(chain);
  const hasSafe = chainHasSafe(chain);

  if (ultimateType === "Externally Owned Account (EOA)") {
    return {
      level: "Critical",
      summary: "Upgrade authority is a single externally owned account",
      reasoning: [
        "Single key compromise risk: one compromised key enables immediate upgrades.",
        "No execution delay: upgrades can be applied immediately.",
        "No multisig protection: no threshold approval required.",
      ],
    };
  }

  if (ultimateType === "Contract") {
    return {
      level: "Medium",
      summary:
        "Upgrade authority is a contract with undetermined governance pattern",
      reasoning: [
        "Upgrade authority is a contract, not an EOA.",
        "Governance pattern could not be automatically determined.",
        "Manual review of authority contract recommended.",
      ],
    };
  }

  if (ultimateType === "Gnosis Safe Multisig" && !hasTimelock) {
    return {
      level: "High",
      summary: "Upgrade authority is a multisig without timelock",
      reasoning: [
        "Multisig threshold enforced: multiple signers required.",
        "No execution delay: upgrades can be applied immediately after multisig approval.",
        "Coordinated signer risk: if threshold signers collude, upgrades proceed without delay.",
      ],
    };
  }

  if (hasTimelock) {
    if (hasSafe) {
      return {
        level: "Low",
        summary: "Upgrade authority uses timelock with multisig",
        reasoning: [
          "Execution delay present: upgrades require waiting period before execution.",
          "Multisig approval required: threshold signers must approve.",
          "Governance transparency: delay allows community review of proposed changes.",
        ],
      };
    }
    return {
      level: "Low",
      summary: "Upgrade authority uses timelock",
      reasoning: [
        "Execution delay present: upgrades require waiting period before execution.",
        "Governance transparency: delay allows review of proposed changes.",
      ],
    };
  }

  return {
    level: "Medium",
    summary: "Upgrade authority classification incomplete",
    reasoning: [
      "Authority type detected but risk classification incomplete.",
      "Manual review recommended.",
    ],
  };
}
