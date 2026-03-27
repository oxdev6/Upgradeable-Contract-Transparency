# Upgradeable-Contract-Transparency
Upgradeable Contract Transparency Toolkit provides open-source tools to detect EIP-1967 proxies, classify upgrade authorities (EOA, multisig, timelock), track upgrades across chains, and produce datasets and reports, improving governance visibility and ecosystem transparency for developers and researchers.
# Upgradeable Contract Transparency Toolkit

Open infrastructure for analyzing governance control and upgrade activity of EVM smart contracts.

Upgradeable contracts power much of the modern blockchain ecosystem, but the governance mechanisms behind upgrades are often opaque. This toolkit provides open-source tools and datasets to improve transparency around upgradeable contract governance.

The project focuses on answering two critical questions:

• **Who can upgrade a contract?**  
• **When has that contract been upgraded?**

---

## Components

### ProxyScope

ProxyScope is a governance inspection engine for upgradeable smart contracts.

It detects proxy patterns, extracts upgrade authority relationships, and evaluates governance risk.

Capabilities:

- EIP-1967 proxy detection
- Implementation and admin extraction
- Authority classification (EOA, multisig, timelock, contract)
- Governance authority chain tracing
- Deterministic governance risk scoring
- CLI and JSON outputs

ProxyScope answers:

> **Who can upgrade this contract?**

#### CLI usage

From the repository root:

```bash
npm install
npm run build
```

Run the inspector:

```bash
# Human-readable report
npx proxyscope inspect 0xYourContract --chain 1

# JSON output
npx proxyscope inspect 0xYourContract --chain 1 --json
```

#### Simple proxy example

Example command:

```bash
npx proxyscope inspect 0x1234567890abcdef1234567890abcdef12345678 --chain 1
```

Example output (trimmed):

```text
ProxyScope Report
-----------------
Contract: 0x1234567890abcdef1234567890abcdef12345678

Proxy Type: EIP-1967
Implementation: 0xabc...def
Upgrade Authority: 0x111...222
Authority Type: Externally Owned Account (EOA)
```

JSON example:

```bash
npx proxyscope inspect 0x1234567890abcdef1234567890abcdef12345678 --chain 1 --json
```

```json
{
  "proxy": {
    "detected": true,
    "type": "EIP-1967",
    "implementation": {
      "address": "0xabc...def"
    },
    "admin": {
      "address": "0x111...222"
    }
  }
}
```

---

### UpgradeWatch

UpgradeWatch indexes upgrade events across EVM chains to build historical upgrade timelines.

Capabilities:

- Index `Upgraded`, `AdminChanged`, and related events
- Track implementation changes
- Build upgrade timelines
- Generate datasets and reports

UpgradeWatch answers:

> **When has this contract been upgraded?**

---

## Research & Datasets

The toolkit also produces open datasets and reports about upgradeable contract governance.

Examples:

- Upgrade frequency analysis
- Single-key upgrade authority risk
- Most frequently upgraded contracts
- Governance topology samples

These artifacts support ecosystem research and transparency.

---

## Repository Structure


upgrade-transparency-toolkit
│
├─ packages/
│ ├─ proxyscope
│ └─ upgradewatch
│
├─ datasets/
│
├─ reports/
│
└─ examples/


---

## Goals

The project aims to provide reusable infrastructure for:

- wallet security tooling
- governance transparency
- blockchain research
- developer infrastructure

All tools are designed as open public goods.

---

## Roadmap

Phase 1

- Stabilize ProxyScope inspection engine
- Improve governance classification
- Expand test coverage

Phase 2

- Build UpgradeWatch event indexer
- Generate upgrade history datasets

Phase 3

- Publish public datasets and research reports
- Provide API endpoints for integrations

---

## License

MIT
