# Aave V3 Pool (Ethereum) — Example Analysis

- Protocol: Aave
- Chain: Ethereum (1)
- Contract: `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2`

## Proxy summary

- Proxy type: EIP-1967
- Implementation: detected
- Admin: detected

## Authority chain (example)

- Proxy Admin -> Timelock Controller -> Gnosis Safe Multisig

## Governance risk assessment (example)

- Risk level: Low
- Summary: Upgrade authority uses timelock with multisig
- Reasoning:
  - Execution delay present before upgrade execution.
  - Multisig threshold required for administrative actions.
  - Delay window improves transparency and monitoring response.

## Notes

This example demonstrates a comparatively stronger governance topology due to delayed execution and threshold signing.
