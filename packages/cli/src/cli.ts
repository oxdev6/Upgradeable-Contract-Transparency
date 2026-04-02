#!/usr/bin/env node
import { Command } from "commander";
import { isAddress, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { inspectContractJson, type ProxyScopeJsonReport } from "@proxyscope/core";

function renderTextReport(report: ProxyScopeJsonReport): string {
  const lines: string[] = [
    "ProxyScope Report",
    "-----------------",
    `Contract: ${report.contract.address}`,
  ];

  if (!report.contract.bytecodePresent) {
    lines.push("", "Status: No contract bytecode found.");
    return lines.join("\n");
  }

  if (!report.proxy.detected) {
    lines.push("", "Proxy Type: None");
    lines.push("Status: Not detected as an EIP-1967 proxy.");
    return lines.join("\n");
  }

  lines.push(
    "",
    `Proxy Type: ${report.proxy.type}`,
    `Implementation: ${report.proxy.implementation?.address ?? "Unknown"}`,
    `Upgrade Authority: ${report.proxy.admin?.address ?? "Unknown"}`,
  );

  if (report.analysis.ultimateControllerType) {
    lines.push(`Authority Type: ${report.analysis.ultimateControllerType}`);
  }

  lines.push("", "Governance Risk Assessment:");
  lines.push(`Risk Level: ${report.risk.level}`);
  lines.push(`Summary: ${report.risk.summary}`);
  return lines.join("\n");
}

const program = new Command();

program
  .name("proxyscope")
  .description("Upgradeable proxy governance inspector")
  .version("0.1.0");

program
  .command("inspect")
  .argument("<address>", "Contract address")
  .requiredOption("--rpc <url>", "RPC URL (for example: https://eth.llamarpc.com)")
  .option("--json", "Output structured JSON")
  .action(
    async (
      address: string,
      options: {
        rpc: string;
        json?: boolean;
      },
    ) => {
      try {
        if (!isAddress(address)) {
          throw new Error(`Invalid contract address: ${address}`);
        }

        const client = createPublicClient({
          chain: mainnet,
          transport: http(options.rpc),
        });

        const report = await inspectContractJson(client, address);

        if (options.json) {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(report, null, 2));
        } else {
          // eslint-disable-next-line no-console
          console.log(renderTextReport(report));
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred.";
        // eslint-disable-next-line no-console
        console.error(`Error: ${message}`);
        process.exitCode = 1;
      }
    },
  );

program.parse();

