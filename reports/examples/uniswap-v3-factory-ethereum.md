# Uniswap V3 Factory (Ethereum) — Example Analysis

- Protocol: Uniswap
- Chain: Ethereum (1)
- Contract: `0x1F98431c8aD98523631AE4a59f267346ea31F984`

## Proxy summary

- Proxy type: EIP-1967 / non-proxy depends on deployment architecture
- Implementation: protocol-specific
- Admin: protocol-specific

## Authority chain (example)

- Factory/Admin Contract -> Governance Executor

## Governance risk assessment (example)

- Risk level: Medium
- Summary: Upgrade authority is a contract with undetermined governance pattern
- Reasoning:
  - Ultimate authority resolves to contract logic that requires manual review.
  - Automatic classification cannot fully determine constraints from this path.
  - Additional governance contract analysis is required.

## Notes

Uniswap governance often uses a dedicated governance pipeline; this example highlights why contract-based authority paths should be manually reviewed.
