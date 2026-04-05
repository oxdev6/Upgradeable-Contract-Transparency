export interface ChainEndpoint {
  chainId: number;
  name: string;
  rpcUrl: string;
}

/** Supported presets for UpgradeWatch indexing (1–2 chains). */
export const SUPPORTED_UPGRADE_WATCH_CHAINS = [1, 42161] as const;
export type SupportedUpgradeWatchChainId =
  (typeof SUPPORTED_UPGRADE_WATCH_CHAINS)[number];
