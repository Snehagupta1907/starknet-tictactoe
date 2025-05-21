/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useConnect,
  useDisconnect,
  useAccount,
  useProvider,
  argent,
  braavos,
  Connector,
  useInjectedConnectors,
  StarknetConfig,
  voyager,
  jsonRpcProvider,
} from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { constants } from "starknet";

import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";
import { STRK_TOKEN_ADDRESS, TIC_CONTRACT_ADDRESS } from "../constants";



const policies = {
  contracts: {

    [STRK_TOKEN_ADDRESS]: {
      name: "STRK Token",
      description: "Allows interaction with the STRK token contract",
      methods: [{ name: "Approve", entrypoint: "approve", session: true }],
    },
    [TIC_CONTRACT_ADDRESS]: {
      name: "Tic-Tac-Toe game",
      description: "Allows interaction with the Tic-Tac-Toe game contract",
      methods: [
        { name: "Start Game", entrypoint: "start_game", session: true },
        {
          name: "Winner announce",
          entrypoint: "update_winner",
          session: true,
        },
        { name: "Play move", entrypoint: "play_move", session: true },
        { name: "Get game status", entrypoint: "get_game_state", session: true },
      ],
    },
   
  },
};

const SEPOLIA_RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const MAINNET_RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet";
const CURRENT_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "SN_SEPOLIA";

const customProvider = jsonRpcProvider({
  rpc: (chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: MAINNET_RPC_URL };
      case sepolia:
      default:
        return { nodeUrl: SEPOLIA_RPC_URL };
    }
  },
});

const StarknetContext = createContext<any | null>(null);

export const useStarknetContext = () => {
  const context = useContext(StarknetContext);
  if (!context) {
    throw new Error(
      "useStarknetContext must be used within a StarknetProvider"
    );
  }
  return context;
};

const StarknetContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (connector: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await connect({ connector });
    } catch (err) {
      console.error("Connection error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await disconnect();
    } catch (err) {
      console.error("Disconnection error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    connect: handleConnect,
    disconnect: handleDisconnect,
    connectors,
    account: provider,
    connected: isConnected,
    address,
    isLoading,
    error,
  };

  return (
    <StarknetContext.Provider value={value}>
      {children}
    </StarknetContext.Provider>
  );
};

export const StarknetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const chains = [mainnet, sepolia];
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "always",
  });

  const [controllerConnector, setControllerConnector] =
    useState<Connector | null>(null);

  useEffect(() => {
    const init = async () => {
      const { default: ControllerConnector } = await import(
        "@cartridge/connector/controller"
      );

      const controller = new ControllerConnector({
        chains: [{ rpcUrl: SEPOLIA_RPC_URL }, { rpcUrl: MAINNET_RPC_URL }],
        defaultChainId:
          CURRENT_CHAIN_ID === "SN_SEPOLIA"
            ? constants.StarknetChainId.SN_SEPOLIA
            : constants.StarknetChainId.SN_MAIN,
        policies,
      });

      setControllerConnector(controller);
    };

    init();
  }, []);

  const allConnectors: Connector[] = [
    ...injected,
    new WebWalletConnector({
      url: "https://web.argent.xyz",
    }) as unknown as Connector,
    ArgentMobileConnector.init({
      options: {
        dappName: "Lottery Starknet",
        url: "https://lottery-dapp-starknet.vercel.app/",
      },
    }) as unknown as Connector,
    ...(controllerConnector ? [controllerConnector] : []),
  ];

  return (
    <StarknetConfig
      autoConnect={true}
      chains={chains}
      provider={customProvider}
      connectors={allConnectors}
      explorer={voyager}
    >
      <StarknetContextProvider>{children}</StarknetContextProvider>
    </StarknetConfig>
  );
};
