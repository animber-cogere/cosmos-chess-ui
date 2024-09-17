import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useState } from "react";

import { SigningStargateClient, StargateClient, makeCosmoshubPath } from "@cosmjs/stargate";
import { DirectSecp256k1Wallet, DirectSecp256k1HdWallet, OfflineDirectSigner, Registry } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { stringToPath } from "@cosmjs/crypto";

interface Wallet {
  connect: () => Promise<void>;
  connected: boolean;
  disconnect: () => Promise<void>;
  error?: unknown;
  name?: string;
  address?: string;
  signingCosmWasmClient: SigningCosmWasmClient | null;
}

export function useLocalWallet(): Wallet {
  const [connected, setConnected] = useState<boolean>(false);
  const [signingCosmWasmClient, setSigningCosmWasmClient] = useState<SigningCosmWasmClient | null>(null);
  const [error, setError] = useState<unknown | undefined>(null);
  const [name, setName] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);

  const rpc = "http://127.0.0.1:26657";

  const tester1 = {
    hdPaths: stringToPath("m/44'/118'/0'/0/0"),
    name: "tester1",
  };

  const tester2 = {
    hdPaths: stringToPath("m/44'/118'/2'/0/0"),
    name: "tester2",
  };

  const connect = async (): Promise<void> => {
    try {
      // Here you would connect to the wallet, for example using Keplr or another provider.
      // Replace the following with actual wallet connection logic
      const mnemonic = "clip hire initial neck maid actor venue client foam budget lock catalog sweet steak waste crater broccoli pipe steak sister coyote moment obvious choose";

      const player = tester1;

      const tester = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        hdPaths: [player.hdPaths],
        prefix: "juno"
      });

      setAddress((await tester.getAccounts())[0].address);

      setName(player.name);
    
      const client = await SigningCosmWasmClient.connectWithSigner(rpc, tester);

      if (client) {
        setSigningCosmWasmClient(client);
        setConnected(true);
      } else {
        throw new Error('No accounts found');
      }
    } catch (error) {
      setError('Failed to connect wallet:`${error}`');
      setConnected(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      // Disconnect logic goes here. This may vary depending on the wallet provider.
      signingCosmWasmClient?.disconnect();
      setSigningCosmWasmClient(null);
      setConnected(false);
      setAddress("");
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };  
  
  // Logic to manage the wallet
  return {
    connect,
    connected,
    disconnect,
    error,
    name,
    address,
    signingCosmWasmClient,
  };
}