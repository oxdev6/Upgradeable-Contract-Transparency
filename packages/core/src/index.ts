export { IMPLEMENTATION_SLOT, ADMIN_SLOT } from "./proxy/patterns";
export type { Address } from "./utils/rpc";
export { detectProxy } from "./proxy/detectProxy";
export type { ProxyDetectionResult } from "./proxy/detectProxy";
export { readImplementationAddress } from "./proxy/readSlots";
export { classifyAdmin } from "./authority/classifyAdmin";
export type { AdminClassification, AdminClassificationResult } from "./authority/classifyAdmin";
export { detectGnosisSafe } from "./authority/detectGnosisSafe";
export type { GnosisSafeDetails } from "./authority/detectGnosisSafe";
export { detectTimelockController } from "./authority/detectTimelockController";
export type { TimelockControllerDetails } from "./authority/detectTimelockController";
export { classifyAuthority } from "./authority/classifyAuthority";
export type { AuthorityClassification, AuthorityType } from "./authority/classifyAuthority";
export {
  traceAuthorityChain,
  DEFAULT_AUTHORITY_CHAIN_MAX_DEPTH,
} from "./authority/traceAuthorityChain";
export type { AuthorityChainNode } from "./authority/traceAuthorityChain";
export type { GovernanceRisk, RiskLevel } from "./risk/riskModel";
export { evaluateGovernanceRisk } from "./risk/evaluateGovernanceRisk";
export { inspectContractJson } from "./report/inspectContractJson";
export type { ProxyScopeJsonReport, JsonAuthorityNode } from "./report/inspectContractJson";

