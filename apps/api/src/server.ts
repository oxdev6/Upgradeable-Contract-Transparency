import { createServer } from "node:http";
import { isAddress, createPublicClient, defineChain, http } from "viem";
import { inspectContractJson } from "@proxyscope/core";
import {
  indexUpgradeHistoryForChain,
  type ChainEndpoint,
} from "@upgradewatch/core";

function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body, null, 2));
}

function resolveEndpoint(chainId: number, rpcUrl?: string): ChainEndpoint {
  if (rpcUrl) {
    return {
      chainId,
      name: chainId === 42161 ? "Arbitrum One" : "Ethereum",
      rpcUrl,
    };
  }

  if (chainId === 42161) {
    const arb = process.env.ARB_RPC;
    if (!arb) throw new Error("Missing ARB_RPC (or provide rpc query param).");
    return { chainId: 42161, name: "Arbitrum One", rpcUrl: arb };
  }

  const eth = process.env.ETH_RPC;
  if (!eth) throw new Error("Missing ETH_RPC (or provide rpc query param).");
  return { chainId: 1, name: "Ethereum", rpcUrl: eth };
}

const server = createServer(async (req, res) => {
  try {
    if (!req.url) return json(res, 400, { error: "Missing URL." });
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === "/health") {
      return json(res, 200, { ok: true });
    }

    if (url.pathname !== "/inspect") {
      return json(res, 404, { error: "Not found." });
    }

    const address = url.searchParams.get("address");
    const chainId = Number(url.searchParams.get("chainId") ?? "1");
    const rpc = url.searchParams.get("rpc") ?? undefined;
    const fromBlockParam = url.searchParams.get("fromBlock");
    const toBlockParam = url.searchParams.get("toBlock");

    if (!address || !isAddress(address)) {
      return json(res, 400, { error: "Invalid or missing address query param." });
    }
    if (!Number.isInteger(chainId) || chainId <= 0) {
      return json(res, 400, { error: "Invalid chainId query param." });
    }

    const endpoint = resolveEndpoint(chainId, rpc);
    const chain = defineChain({
      id: endpoint.chainId,
      name: endpoint.name,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [endpoint.rpcUrl] } },
    });

    const client = createPublicClient({
      chain,
      transport: http(endpoint.rpcUrl),
    });

    const contract = address as `0x${string}`;
    const proxyscope = await inspectContractJson(client, contract);
    const upgradewatch = await indexUpgradeHistoryForChain(
      client,
      endpoint,
      contract,
      {
        fromBlock: fromBlockParam ? BigInt(fromBlockParam) : undefined,
        toBlock: toBlockParam ? BigInt(toBlockParam) : undefined,
      },
    );

    return json(res, 200, {
      contract,
      chain: { id: endpoint.chainId, name: endpoint.name },
      proxyscope,
      upgradewatch,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return json(res, 500, { error: message });
  }
});

const port = Number(process.env.PORT ?? "3001");
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

