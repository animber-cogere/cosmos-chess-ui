import { useRef } from "react";
import { Coin, StdFee } from "@cosmjs/amino";
import { CosmWasmClient, ExecuteResult, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ChainInfo, Window as KeplrWindow } from "@keplr-wallet/types";
import { useWallet, useWalletManager } from "@noahsaso/cosmodal";
import { useLocalWallet } from "./useLocalWallet";

export interface CosmWasm {
  address?: string;
  connect: () => void;
  connected: boolean;
  disconnect: () => void;
  error?: unknown;
  execute: (
    contractAddress: string,
    msg: Record<string, unknown>,
    fee?: number | StdFee | "auto",
    memo?: string | undefined,
    funds?: readonly Coin[] | undefined
  ) => Promise<ExecuteResult>;
  name?: string;
  queryContractSmart: (
    contractAddress: string,
    queryMsg: Record<string, unknown>
  ) => Promise<any>;
}

export function useCosmWasm(
  chainInfo: ChainInfo,
  defaultFee: number | StdFee | "auto" = { amount: [], gas: "200000" }
): CosmWasm {
  const { connect, connected, disconnect } = useWalletManager();
  const { error, name, address, signingCosmWasmClient } = useWallet();

  const queryClient = useRef<CosmWasmClient | undefined>(undefined);

  return {
    address,
    connect,
    connected,
    disconnect,
    error,
    execute,
    name,
    queryContractSmart,
  };

  async function execute(
    contractAddress: string,
    msg: Record<string, unknown>,
    fee?: number | StdFee | "auto",
    memo?: string | undefined,
    funds?: readonly Coin[] | undefined
  ): Promise<ExecuteResult> {
    if (!address || !connected || !signingCosmWasmClient) {
      return Promise.reject(new Error("Unable to execute"));
    }
    return signingCosmWasmClient.execute(
      address,
      contractAddress,
      msg,
      fee ?? defaultFee,
      memo,
      funds
    );
  }

  async function queryContractSmart(
    contractAddress: string,
    queryMsg: Record<string, unknown>
  ): Promise<any> {
    let client = signingCosmWasmClient || queryClient.current;
    if (!client) {
      client = await CosmWasmClient.connect(chainInfo.rpc);
      queryClient.current = client;
    }
    return client.queryContractSmart(contractAddress, queryMsg);
  }
}

export function useLocalCosmWasm(
  chainInfo: ChainInfo,
  defaultFee: number | StdFee | "auto" = { amount: [], gas: "200000" }
): CosmWasm {
  const { connect, connected, disconnect, error, name, address, signingCosmWasmClient } = useLocalWallet();

  const queryClient = useRef<CosmWasmClient | undefined>(undefined);

  return {
    address,
    connect,
    connected,
    disconnect,
    error,
    execute,
    name,
    queryContractSmart,
  };

  async function execute(
    contractAddress: string,
    msg: Record<string, unknown>,
    fee?: number | StdFee | "auto",
    memo?: string | undefined,
    funds?: readonly Coin[] | undefined
  ): Promise<ExecuteResult> {
    if (!address || !connected || !signingCosmWasmClient) {
      return Promise.reject(new Error("Unable to execute"));
    }
    return signingCosmWasmClient.execute(
      address,
      contractAddress,
      msg,
      fee ?? defaultFee,
      memo,
      funds
    );
  }

  async function queryContractSmart(
    contractAddress: string,
    queryMsg: Record<string, unknown>
  ): Promise<any> {
    let client = signingCosmWasmClient || queryClient.current;
    if (!client) {
      client = await CosmWasmClient.connect(chainInfo.rpc);
      queryClient.current = client;
    }
    return client.queryContractSmart(contractAddress, queryMsg);
  }
}
