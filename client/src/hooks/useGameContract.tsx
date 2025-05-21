/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useState } from "react";
import { CallData, cairo, BigNumberish } from "starknet";
import { TIC_CONTRACT_ADDRESS, provider, STRK_TOKEN_ADDRESS, abi } from "../constants";
import { toast } from "react-hot-toast";
import { stark } from "starknet";

const COMPUTER_MOVED_SELECTOR = "0x1de6efda73bf7cdf468f4d493116062cc29b8291b1920844c8efb9301725837"
const PLAYER_MOVED_SELECTOR = "0x132cd782aa62d9aeaf17b71256b4984aef1930fc3abb2d5b81183ee54d1f163"

export interface GameState {
  player: string;
  winner: string;
  bet: BigNumberish;
  moves_made: number;
  is_player_turn: boolean;
}

export interface BoardCell {
  value: number; // 0 = empty, 1 = player, 2 = computer
  x: number;
  y: number;
}

export interface GameMove {
  gameId: number;
  x: number;
  y: number;
  player: number; // 1 for player, 2 for computer
}

export const useTicTacToeContract = (connected: boolean, account: any) => {

  const [currentGameId, setCurrentGameId] = useState<number | null>(null);


  const startGame = useCallback(
    async (bet: BigNumberish) => {
      if (!connected || !account) {
        toast.error("Please connect your wallet first");
        return null;
      }

      if (!bet) {
        toast.error("Bet amount must be greater than zero");
        return null;
      }

      console.log({bet})

      const id = toast.loading("Starting a new game...");

      try {
        // First approve the token transfer
        const multiCall = await account.execute([
          {
            contractAddress: STRK_TOKEN_ADDRESS,
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: TIC_CONTRACT_ADDRESS,
              amount: cairo.uint256(bet),
            }),
          },
          {
            contractAddress: TIC_CONTRACT_ADDRESS,
            entrypoint: "start_game",
            calldata: CallData.compile({
              bet: cairo.uint256(bet),
            }),
          },
        ]);

        const txHash = multiCall?.transaction_hash;
        if (!txHash) {
          throw new Error("Transaction hash missing");
        }
        console.log({ txHash });

        const receipt = await provider.waitForTransaction(txHash);
        console.log("Transaction receipt:", receipt);

        // Find the GameStarted event
        const event = receipt?.events?.find(
          (e: any) => e.from_address === TIC_CONTRACT_ADDRESS
        );

        // Extract the game_id from the event data
        if (event && event.data && event.data.length > 0) {
          const gameId = parseInt(event.data[0], 16);
          console.log({gameId})
          setCurrentGameId(gameId);

          toast.success("Game started successfully!", { id });
          return gameId;
        }

        toast.success("Game started!", { id });
        return null;
      } catch (err) {
        console.error("Failed to start game:", err);
        toast.error("Error starting game", { id });
        return null;
      }
    },
    [connected, account]
  );



const playMove = useCallback(
  async (gameId: number, x: number, y: number) => {
    if (!connected || !account) {
      toast.error("Please connect your wallet first");
      return { success: false };
    }

    if (x < 0 || x > 2 || y < 0 || y > 2) {
      toast.error("Invalid move coordinates");
      return { success: false };
    }

    const id = toast.loading("Making your move...");

    try {
      const callResult = await account.execute({
        contractAddress: TIC_CONTRACT_ADDRESS,
        entrypoint: "play_move",
        calldata: CallData.compile({ id: gameId, x, y }),
      });

      const txHash = callResult?.transaction_hash;
      if (!txHash) throw new Error("Transaction hash missing");

      const receipt = await provider.waitForTransaction(txHash);
      console.log("Move transaction receipt:", receipt);

      let computerMove: { success: boolean; x?: number; y?: number } = { success: false };
      let gameResult: {
        success: boolean;
        winner?: string;
        isPlayerWinner?: boolean;
        isComputerWinner?: boolean;
        isTie?: boolean;
      } = { success: false };

      for (const event of receipt?.events || []) {
        const { from_address, keys, data } = event;

        if (from_address !== TIC_CONTRACT_ADDRESS || !keys?.length) continue;

        const keyStr = keys[0];

        // ComputerMoved
        if (keyStr === COMPUTER_MOVED_SELECTOR && data.length >= 3) {
          const computerX = parseInt(data[1], 16);
          const computerY = parseInt(data[2], 16);
          computerMove = { success: true, x: computerX, y: computerY };
        }

        // GameFinished
        if (keyStr === "0x17b45705fce8d870c9cf2a66c27f1add6bd106d4fe0e10d237312c353dd4384" && data.length >= 5) {
          const winner = data[4];
          console.log({ winner });
          gameResult = {
            success: true,
            winner,
            isPlayerWinner: winner === "0x1",
            isComputerWinner: winner === "0x2",
            isTie: winner === "0x3",
          };
        }
      }

      toast.success("Move played successfully!", { id });

      return { success: true, computerMove, gameResult };
    } catch (err) {
      console.error("Failed to play move:", err);
      toast.error("Error playing move", { id });
      return { success: false };
    }
  },
  [connected, account]
);



const getGameState = useCallback(
  async (gameId: number): Promise<GameState | null> => {
    try {
      // Making a direct call to the contract using provider
      const result = await provider.callContract({
        contractAddress: TIC_CONTRACT_ADDRESS,
        entrypoint: "get_game_state",
        calldata: CallData.compile({
          id: gameId,
        }),
      });

      console.log(result);
      if (!result || result.length === 0) {
        throw new Error("Invalid result from contract call");
      }

      // Parse the result based on the actual GameState structure
      return {
        player: result[0],                  // Player address
        winner: result[1],                  // Winner address
        bet: result[2],                     // Bet amount
        moves_made: parseInt(result[3], 16), // Moves made as number
        is_player_turn: result[5] === "0x1", // Is player turn boolean (position 5!)
      };
    } catch (err) {
      console.error("Failed to get game state:", err);
      return null;
    }
  },
  []
);

  // For convenience, return the current game ID along with all the functions
  return { 
    currentGameId, 
    startGame, 
    playMove, 
    getGameState,
  };
};