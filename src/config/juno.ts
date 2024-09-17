import { ChainInfo, Currency } from "@keplr-wallet/types";

const JUNO: Currency = {
  coinDenom: "JUNO",
  coinMinimalDenom: "ujuno",
  coinDecimals: 6,
  coinGeckoId: "juno-network",
};

export const CHAIN_INFO: ChainInfo = {
  chainId: "juno-1",
  chainName: "Juno",
  rpc: "https://juno-rpc.stakeandrelax.net",
  rest: "https://juno-api.stakeandrelax.net",
  stakeCurrency: JUNO,
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "juno",
    bech32PrefixAccPub: "junopub",
    bech32PrefixValAddr: "junovaloper",
    bech32PrefixValPub: "junovaloperpub",
    bech32PrefixConsAddr: "junovalcons",
    bech32PrefixConsPub: "junovalconspub",
  },
  currencies: [JUNO],
  feeCurrencies: [JUNO],
  coinType: 118,
  gasPriceStep: {
    low: 0.01,
    average: 0.025,
    high: 0.04,
  },
};

// 0.4.1
export const CONTRACT =
  "juno19jrfw6y7ljxnh389cl9eewrs4rfgf0w92g0m59lp0llvdsf8a0csunfq3p";
