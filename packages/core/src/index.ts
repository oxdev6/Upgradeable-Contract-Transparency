export { IMPLEMENTATION_SLOT, ADMIN_SLOT } from "./proxy/patterns";
export type { Address } from "./utils/rpc";
export { detectProxy } from "./proxy/detectProxy";
export type { ProxyDetectionResult } from "./proxy/detectProxy";
export { readImplementationAddress } from "./proxy/readSlots";
export { classifyAdmin } from "./authority/classifyAdmin";
export type { AdminClassification, AdminClassificationResult } from "./authority/classifyAdmin";
export { detectGnosisSafe } from "./authority/detectGnosisSafe";
export type { GnosisSafeDetails } from "./authority/detectGnosisSafe";

