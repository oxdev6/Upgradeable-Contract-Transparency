# Compound Comptroller (Ethereum) — Example Analysis

- Protocol: Compound
- Chain: Ethereum (1)
- Contract: `0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B`

## Proxy summary

- Proxy type: EIP-1967 (example profile)
- Implementation: detected
- Admin: detected

## Authority chain (example)

- Proxy Admin -> Externally Owned Account (EOA)

## Governance risk assessment (example)

- Risk level: Critical
- Summary: Upgrade authority is a single externally owned account
- Reasoning:
  - Single-key compromise risk allows immediate upgrades.
  - No enforced delay prior to execution.
  - No multisig threshold protection in this authority path.

## Notes

This example represents a high-priority monitoring target under the single-key control model.
