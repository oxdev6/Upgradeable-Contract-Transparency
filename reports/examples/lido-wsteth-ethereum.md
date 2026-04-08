# Lido wstETH (Ethereum) — Example Analysis

- Protocol: Lido
- Chain: Ethereum (1)
- Contract: `0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0`

## Proxy summary

- Upgradeability: component-dependent and governance-administered
- Admin path: protocol governance authority chain

## Authority chain (example)

- Proxy Admin -> Multisig / governance committee -> protocol execution roles

## Governance risk assessment (example)

- Risk level: High
- Summary: Multisig-based control without enforceable delay in execution path
- Reasoning:
  - Multiple signers reduce single-key compromise risk.
  - Without timelock, approved changes can execute quickly.
  - Monitoring and signer policy quality are critical.

## Notes

Use this as a structured example for multisig-dominant governance analysis.
