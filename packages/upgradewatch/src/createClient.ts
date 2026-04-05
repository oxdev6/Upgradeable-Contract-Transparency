import { createPublicClient, defineChain, http, type PublicClient } from "viem";
import type { ChainEndpoint } from "./chains";

export function createUpgradeWatchPublicClient(
  endpoint: ChainEndpoint,
): PublicClient {
  const chain = defineChain({
    id: endpoint.chainId,
    name: endpoint.name,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [endpoint.rpcUrl] } },
  });

  return createPublicClient({
    chain,
    transport: http(endpoint.rpcUrl),
  });
}
