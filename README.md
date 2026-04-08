# Upgradeable Contract Transparency Toolkit

Open infrastructure for analyzing governance control and upgrade activity of EVM smart contracts.

This repository focuses on two questions:

- **Who can upgrade a contract?**
- **When has that contract been upgraded?**

## Components

### ProxyScope (`@proxyscope/core`, `@proxyscope/cli`)

Governance inspection engine for upgradeable contracts.

Capabilities:

- EIP-1967 proxy detection
- Implementation and admin extraction
- Authority classification (EOA / multisig / timelock / contract)
- Authority chain tracing (depth 2)
- Deterministic governance risk scoring (`VeryLow` → `Critical`)
- Structured JSON report output
- CLI `inspect` command

### UpgradeWatch (`@upgradewatch/core`)

Upgrade-event indexing and dataset generation toolkit.

Capabilities:

- Parse `Upgraded` and `AdminChanged` logs
- Index upgrade history for a contract on 1–2 chains
- Generate top-20 upgrade history dataset
- Generate single-key-risk dataset (EOA-controlled upgrade authority)

### API Skeleton (`@upgradewatch/api`)

Minimal JSON API endpoint to combine ProxyScope + UpgradeWatch outputs.

- `GET /health`
- `GET /inspect?address=<0x...>&chainId=1[&rpc=...&fromBlock=...&toBlock=...]`

## Quick Start

From repository root:

```bash
npm install
npm run build
```

## CLI Usage

Build and run `inspect`:

```bash
# Human-readable output
npx proxyscope inspect 0xYourContract --rpc https://eth.llamarpc.com

# Structured JSON output
npx proxyscope inspect 0xYourContract --rpc https://eth.llamarpc.com --json
```

Example:

```bash
npx proxyscope inspect 0x1234567890abcdef1234567890abcdef12345678 --rpc https://eth.llamarpc.com --json
```

## API Usage

Start API:

```bash
ETH_RPC="https://eth.llamarpc.com" npm run build:api
ETH_RPC="https://eth.llamarpc.com" npm run dev:api
```

Query API:

```bash
curl "http://localhost:3001/inspect?address=0x1234567890abcdef1234567890abcdef12345678&chainId=1"
```

## Governance Risk Examples

ProxyScope uses deterministic risk scoring:

- **Critical**: single EOA controls upgrades
- **High**: multisig without timelock
- **Low**: timelock-based path (with/without multisig)
- **Medium**: contract authority with undetermined governance
- **VeryLow**: not upgradeable

Sample risk object:

```json
{
  "risk": {
    "level": "Critical",
    "summary": "Upgrade authority is a single externally owned account",
    "reasoning": [
      "Single key compromise risk: one compromised key enables immediate upgrades.",
      "No execution delay: upgrades can be applied immediately.",
      "No multisig protection: no threshold approval required."
    ]
  }
}
```

## Datasets

Generate upgrade history top-20:

```bash
ETH_RPC="https://eth.llamarpc.com" FROM_BLOCK=18500000 npm run dataset:upgrade-history
```

Generate single-key risk dataset:

```bash
ETH_RPC="https://eth.llamarpc.com" npm run dataset:single-key-risk
```

Outputs:

- `datasets/upgrade-history-top20.json`
- `datasets/single-key-risk-contracts.json`

## Example Reports

Sample analysis reports are in `reports/examples/`, including:

- Aave
- Uniswap
- Compound
- Maker
- Curve
- Lido
- Chainlink
- ENS

## Roadmap Status (21-day build)

- Week 1: ProxyScope core + CLI foundation
- Week 2: authority tracing, risk model, JSON output, and tests
- Week 3: UpgradeWatch parser/indexing/datasets, API skeleton, and example reports

## License

MIT
