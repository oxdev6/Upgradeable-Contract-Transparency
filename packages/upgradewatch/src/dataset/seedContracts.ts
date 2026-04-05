/**
 * Curated proxy / upgradeable contracts for dataset generation.
 * Addresses are chain-specific; omit a chain if unknown for that deployment.
 */
export interface SeedContract {
  label: string;
  addresses: Partial<Record<number, `0x${string}`>>;
}

export const DEFAULT_UPGRADE_DATASET_SEEDS: SeedContract[] = [
  {
    label: "Aave V3 Pool",
    addresses: {
      1: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      42161: "0x794a61358D6845594F94dE05d9D219FCd8E79093",
    },
  },
  {
    label: "Compound cUSDCv3 (Ethereum)",
    addresses: {
      1: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
    },
  },
  {
    label: "Compound cUSDC (legacy)",
    addresses: {
      1: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
    },
  },
  {
    label: "Compound cDAI (legacy)",
    addresses: {
      1: "0x5d3a536E4D6cDbD6114cc1Ead35777bAB948E364",
    },
  },
  {
    label: "Compound Comptroller",
    addresses: {
      1: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B",
    },
  },
  {
    label: "Lido wstETH (Ethereum)",
    addresses: {
      1: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    },
  },
  {
    label: "RocketPool rETH (Ethereum)",
    addresses: {
      1: "0xae78736Cd615f374D3085123A210448E74Fc6392",
    },
  },
  {
    label: "Frax Ether (sfrxETH) (Ethereum)",
    addresses: {
      1: "0xac3E018457B222D93114458476f3E3416Abbe38F",
    },
  },
  {
    label: "Curve crvUSD Controller (Ethereum)",
    addresses: {
      1: "0x0655977F2B6AdA2Da3d792f0383BC93621232dF7",
    },
  },
  {
    label: "Maker DAI (Ethereum)",
    addresses: {
      1: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
  },
  {
    label: "ENS Registry (Ethereum)",
    addresses: {
      1: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    },
  },
  {
    label: "Optimism Portal (reference address on Ethereum L1)",
    addresses: {
      1: "0xbEb5Fc5795F071883d42bA0b92158091f5f8436A",
    },
  },
  {
    label: "Arbitrum Bridge (reference address on Ethereum L1)",
    addresses: {
      1: "0x8315177aB297bA3A84b7bF69201d24D2fD95CD5e",
    },
  },
  {
    label: "Uniswap V3 Factory (Ethereum)",
    addresses: {
      1: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    },
  },
  {
    label: "Uniswap V3 SwapRouter02 (Ethereum)",
    addresses: {
      1: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    },
  },
  {
    label: "Chainlink ETH/USD feed proxy (Ethereum)",
    addresses: {
      1: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
  },
  {
    label: "USDC Token (Ethereum)",
    addresses: {
      1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
  },
  {
    label: "USDT Token (Ethereum)",
    addresses: {
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
  },
  {
    label: "WBTC (Ethereum)",
    addresses: {
      1: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    },
  },
  {
    label: "stETH (Lido) (Ethereum)",
    addresses: {
      1: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    },
  },
  {
    label: "Blur Exchange (Ethereum)",
    addresses: {
      1: "0x0000000000A39bb272e79075De8e904860EfD2A",
    },
  },
  {
    label: "Seaport 1.5 (Ethereum)",
    addresses: {
      1: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
    },
  },
];
