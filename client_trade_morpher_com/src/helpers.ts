import { defineChain, keccak256, toHex } from "viem";

export const soliditySha3 = (data: string) => {
  const return_data = keccak256(toHex(data));
  return return_data;
};

export const getChain = (chain_id: number, rpcEndpointURL: string) => {
  const polygonChain = defineChain({
    id: chain_id,
    name: "Wallet Linked Chain",
    nativeCurrency: {
      decimals: 18,
      name: "GAS",
      symbol: "GAS",
    },
    rpcUrls: {
      default: {
        http: [rpcEndpointURL],
        webSocket:
          rpcEndpointURL.includes("wss:") || rpcEndpointURL.includes("ws:")
            ? [rpcEndpointURL]
            : undefined,
      },
    },
  });

  return polygonChain;
};
